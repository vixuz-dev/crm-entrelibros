import React, { useState, useEffect } from 'react';
import { FiType, FiFileText, FiActivity, FiSave, FiEdit } from 'react-icons/fi';
import FileUpload from '../ui/FileUpload';
import RichTextEditor from '../ui/RichTextEditor';
import { saveBookClubFile } from '../../api/bookClubApi';
import { showSuccess } from '../../utils/notifications';

const CourseSectionsSection = ({
  // Monthly Activity Section
  monthlyActivityTitle,
  setMonthlyActivityTitle,
  monthlyActivitySubtitle,
  setMonthlyActivitySubtitle,
  monthlyActivityFileUrl,
  setMonthlyActivityFileUrl,
  activityName,
  setActivityName,
  activityDescription,
  setActivityDescription,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  const DEFAULT_TITLE = 'Actividad del mes';
  
  const [localTitle, setLocalTitle] = useState(monthlyActivityTitle || DEFAULT_TITLE);
  const [localSubtitle, setLocalSubtitle] = useState(monthlyActivitySubtitle || '');
  const [localFileUrl, setLocalFileUrl] = useState(monthlyActivityFileUrl || '');
  const [localActivityName, setLocalActivityName] = useState(activityName || '');
  const [localActivityDescription, setLocalActivityDescription] = useState(activityDescription || '');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Archivo seleccionado (para subir después)
  const [selectedFileBase64, setSelectedFileBase64] = useState(null); // Base64 del archivo seleccionado

  useEffect(() => {
    setLocalTitle(monthlyActivityTitle || DEFAULT_TITLE);
  }, [monthlyActivityTitle]);

  useEffect(() => {
    setLocalSubtitle(monthlyActivitySubtitle || '');
  }, [monthlyActivitySubtitle]);

  useEffect(() => {
    setLocalFileUrl(monthlyActivityFileUrl || '');
  }, [monthlyActivityFileUrl]);

  useEffect(() => {
    setLocalActivityName(activityName || '');
  }, [activityName]);

  useEffect(() => {
    setLocalActivityDescription(activityDescription || '');
  }, [activityDescription]);

  // Manejar guardar
  const handleSave = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!localSubtitle || localSubtitle.trim() === '') {
      newErrors.subtitle = 'El subtítulo es obligatorio';
    }
    if (!selectedFile && !selectedFileBase64 && (!localFileUrl || localFileUrl.trim() === '')) {
      newErrors.fileUrl = 'El archivo de la actividad es obligatorio';
    }
    if (!localActivityName || localActivityName.trim() === '') {
      newErrors.activityName = 'El nombre de la actividad es obligatorio';
    }
    if (!localActivityDescription || localActivityDescription.trim() === '') {
      newErrors.activityDescription = 'La descripción de la actividad es obligatoria';
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
          
          // Subir el archivo al endpoint de S3
          const response = await saveBookClubFile(fileExtension, selectedFileBase64);
          
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

      setMonthlyActivityTitle(localTitle || DEFAULT_TITLE);
      setMonthlyActivitySubtitle(localSubtitle);
      setMonthlyActivityFileUrl(finalFileUrl);
      setActivityName(localActivityName);
      setActivityDescription(localActivityDescription);

      // Limpiar archivo seleccionado después de guardar
      setSelectedFile(null);
      setSelectedFileBase64(null);

      showSuccess('Actividad del Mes guardada exitosamente');
      
      const button = document.activeElement;
      if (button && button.type === 'submit') {
        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 1000);
      }

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
            Actividad del Mes
          </h2>
          <p className="text-gray-700 font-cabin-regular">
            Configura la actividad especial para disfrutar en familia
          </p>
        </div>
        {isLocked && showEditButton && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar actividad del mes"
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 font-cabin-medium transform hover:scale-105 active:scale-95"
          >
            <FiEdit className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Monthly Activity Section */}
      <form onSubmit={handleSave} className="space-y-6">
            {/* Campos Título y Subtítulo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="monthlyActivityTitle" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiType className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="monthlyActivityTitle"
                    type="text"
                    value={localTitle}
                    onChange={(e) => {
                      setLocalTitle(e.target.value);
                      if (errors.title) {
                        setErrors(prev => ({ ...prev, title: null }));
                      }
                    }}
                    placeholder="Ej: Actividad del mes"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.title && (
                  <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="monthlyActivitySubtitle" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                  Subtítulo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiType className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="monthlyActivitySubtitle"
                    type="text"
                    value={localSubtitle}
                    onChange={(e) => {
                      setLocalSubtitle(e.target.value);
                      if (errors.subtitle) {
                        setErrors(prev => ({ ...prev, subtitle: null }));
                      }
                    }}
                    placeholder="Ej: Una actividad especial para disfrutar en familia"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
                      errors.subtitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.subtitle && (
                  <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.subtitle}</p>
                )}
              </div>
            </div>

            {/* Campo Subir Actividad */}
            <div>
              <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                Subir Actividad *
              </label>
              <FileUpload
                value={localFileUrl}
                onChange={(url) => {
                  setLocalFileUrl(url);
                  if (errors.fileUrl) {
                    setErrors(prev => ({ ...prev, fileUrl: null }));
                  }
                }}
                onFileSelect={handleFileSelect}
                accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                allowedExtensions={['pdf', 'png', 'jpg', 'jpeg', 'webp']}
                maxSize={50 * 1024 * 1024} // 50MB
                fileTypeLabel="PDF o imagen"
                className="w-full"
              />
              {errors.fileUrl && (
                <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.fileUrl}</p>
              )}
            </div>

            {/* Información de la Actividad */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-cabin-semibold text-gray-700 mb-4 flex items-center">
                <FiActivity className="mr-2 h-4 w-4" />
                Información de la Actividad
              </h4>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="activityName" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                    Nombre de la Actividad *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiActivity className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="activityName"
                      type="text"
                      value={localActivityName}
                      onChange={(e) => {
                        setLocalActivityName(e.target.value);
                        if (errors.activityName) {
                          setErrors(prev => ({ ...prev, activityName: null }));
                        }
                      }}
                      placeholder="Ej: Titere"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
                        errors.activityName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.activityName && (
                    <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.activityName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="activityDescription" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                    Descripción de la Actividad *
                  </label>
                  <RichTextEditor
                    value={localActivityDescription}
                    onChange={(value) => {
                      setLocalActivityDescription(value);
                      if (errors.activityDescription) {
                        setErrors(prev => ({ ...prev, activityDescription: null }));
                      }
                    }}
                    placeholder="Ej: Descarga la ficha para realizar esta divertida actividad en casa."
                    minHeight="200px"
                  />
                  {errors.activityDescription && (
                    <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.activityDescription}</p>
                  )}
                </div>
              </div>
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
                  aria-label="Guardar actividad del mes"
                  className={`px-6 py-3 bg-amber-500 text-white rounded-lg transition-all duration-200 font-cabin-medium flex items-center space-x-2 transform ${
                    isSaving 
                      ? 'opacity-75 cursor-not-allowed' 
                      : 'hover:bg-amber-600 hover:shadow-lg hover:scale-105 active:scale-95'
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

export default CourseSectionsSection;

