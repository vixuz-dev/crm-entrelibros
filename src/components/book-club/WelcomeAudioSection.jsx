import React, { useState, useEffect } from 'react';
import { FiType, FiSave, FiEdit } from 'react-icons/fi';
import FileUpload from '../ui/FileUpload';
import { saveBookClubFile } from '../../api/bookClubApi';
import { showSuccess } from '../../utils/notifications';

const WelcomeAudioSection = ({
  welcomeAudioTitle,
  setWelcomeAudioTitle,
  welcomeAudioSubtitle,
  setWelcomeAudioSubtitle,
  welcomeAudioFileUrl,
  setWelcomeAudioFileUrl,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  // Estado local para los campos del formulario
  const [localTitle, setLocalTitle] = useState(welcomeAudioTitle || '');
  const [localSubtitle, setLocalSubtitle] = useState(welcomeAudioSubtitle || '');
  const [localFileUrl, setLocalFileUrl] = useState(welcomeAudioFileUrl || '');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Archivo seleccionado (para subir después)
  const [selectedFileBase64, setSelectedFileBase64] = useState(null); // Base64 del archivo seleccionado

  // Sincronizar estado local cuando cambian los props
  useEffect(() => {
    setLocalTitle(welcomeAudioTitle || '');
  }, [welcomeAudioTitle]);

  useEffect(() => {
    setLocalSubtitle(welcomeAudioSubtitle || '');
  }, [welcomeAudioSubtitle]);

  useEffect(() => {
    setLocalFileUrl(welcomeAudioFileUrl || '');
  }, [welcomeAudioFileUrl]);

  // Manejar guardar
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios (solo subtítulo y archivo)
    const newErrors = {};
    // El título es opcional, no se valida
    if (!localSubtitle || localSubtitle.trim() === '') {
      newErrors.subtitle = 'El subtítulo es obligatorio';
    }
    
    // Validar que haya un archivo seleccionado o una URL existente
    if (!selectedFile && !selectedFileBase64 && (!localFileUrl || localFileUrl.trim() === '')) {
      newErrors.fileUrl = 'El archivo de audio es obligatorio';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Limpiar errores
    setErrors({});
    setIsSaving(true);

    try {
      let finalFileUrl = localFileUrl;

      // Si hay un archivo nuevo seleccionado, subirlo a S3
      if (selectedFile && selectedFileBase64) {
        try {
          // Obtener la extensión del archivo
          const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
          
          // Subir el archivo al endpoint de S3 (pasar el objeto File para audio)
          const response = await saveBookClubFile(fileExtension, selectedFileBase64, selectedFile);
          
          // Validar respuesta del API
          if (response.status === true && response.file_url) {
            // Usar la URL de S3 retornada
            finalFileUrl = response.file_url;
          } else {
            // Mostrar error del API
            const errorMessage = response.status_Message || 'Error al subir el archivo';
            setErrors({ fileUrl: errorMessage });
            setIsSaving(false);
            return;
          }
        } catch (error) {
          // Manejar errores del API
          const errorMessage = error.response?.data?.status_Message || error.message || 'Error al subir el archivo';
          setErrors({ fileUrl: errorMessage });
          setIsSaving(false);
          return;
        }
      }

      // Guardar en el store (título puede estar vacío)
      setWelcomeAudioTitle(localTitle || '');
      setWelcomeAudioSubtitle(localSubtitle);
      setWelcomeAudioFileUrl(finalFileUrl);

      // Limpiar archivo seleccionado después de guardar
      setSelectedFile(null);
      setSelectedFileBase64(null);

      // Mostrar mensaje de éxito
      showSuccess('Audio de Bienvenida guardado exitosamente');

      // Bloquear la sección después de guardar
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ general: 'Error al guardar la configuración' });
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cambio de archivo - Solo guardar en estado local, NO subir a S3 todavía
  const handleFileSelect = (file, base64File) => {
    if (!file || !base64File) {
      setLocalFileUrl('');
      setSelectedFile(null);
      setSelectedFileBase64(null);
      if (errors.fileUrl) {
        setErrors(prev => ({ ...prev, fileUrl: null }));
      }
      return;
    }

    // Guardar el archivo y su base64 en estado local (se subirá cuando se guarde)
    setSelectedFile(file);
    setSelectedFileBase64(base64File);
    
    // Mostrar el archivo seleccionado (usar base64 temporalmente para preview)
    setLocalFileUrl(base64File);
    
    // Limpiar errores si había alguno
    if (errors.fileUrl) {
      setErrors(prev => ({ ...prev, fileUrl: null }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
            Audio de Bienvenida
          </h2>
          <p className="text-gray-600 font-cabin-regular">
            Configura el audio de bienvenida del curso
          </p>
        </div>
        {isLocked && showEditButton && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium"
          >
            <FiEdit className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Campos Título y Subtítulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="welcomeAudioTitle" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Título
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiType className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="welcomeAudioTitle"
                type="text"
                value={localTitle}
                onChange={(e) => {
                  if (!isLocked) {
                    setLocalTitle(e.target.value);
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: null }));
                    }
                  }
                }}
                placeholder="Ej: Audio de bienvenida"
                disabled={isLocked}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="welcomeAudioSubtitle" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Subtítulo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiType className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="welcomeAudioSubtitle"
                type="text"
                value={localSubtitle}
                onChange={(e) => {
                  if (!isLocked) {
                    setLocalSubtitle(e.target.value);
                    if (errors.subtitle) {
                      setErrors(prev => ({ ...prev, subtitle: null }));
                    }
                  }
                }}
                placeholder="Ej: Te cuento cuáles son los 2 ingredientes..."
                disabled={isLocked}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
                  errors.subtitle ? 'border-red-500' : 'border-gray-300'
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.subtitle && (
              <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.subtitle}</p>
            )}
          </div>
        </div>

        {/* Campo Archivo Audio */}
        <div>
          <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Archivo de Audio *
          </label>
          <FileUpload
            value={localFileUrl}
            onChange={(url) => {
              if (!isLocked) {
                setLocalFileUrl(url);
                if (errors.fileUrl) {
                  setErrors(prev => ({ ...prev, fileUrl: null }));
                }
              }
            }}
            onFileSelect={isLocked ? undefined : handleFileSelect}
            accept="audio/*"
            allowedExtensions={['mp3', 'mp4', 'wav']}
            maxSize={100 * 1024 * 1024} // 100MB
            fileTypeLabel="audio"
            className="w-full"
            disabled={isLocked}
          />
          {errors.fileUrl && (
            <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.fileUrl}</p>
          )}
        </div>

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-cabin-regular">{errors.general}</p>
          </div>
        )}

        {/* Botón de guardar - Solo mostrar si no está bloqueado */}
        {!isLocked && (
          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-3 bg-amber-500 text-white rounded-lg transition-colors font-cabin-medium flex items-center space-x-2 ${
                isSaving 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:bg-amber-600'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>Guardar Configuración</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default WelcomeAudioSection;

