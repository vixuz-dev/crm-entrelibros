import React, { useState, useEffect } from 'react';
import { FiType, FiSave, FiRotateCcw, FiEdit } from 'react-icons/fi';
import ImageUpload from '../ui/ImageUpload';
import { saveBookClubFile } from '../../api/bookClubApi';
import { showSuccess } from '../../utils/notifications';

// Valores por defecto
const DEFAULT_TITLE = 'Book Club';
const DEFAULT_SUBTITLE = 'Lectores';
const DEFAULT_FILE_URL = 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg';

const HeroSectionSection = ({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  fileUrl,
  setFileUrl,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  // Determinar valores iniciales: usar valores del store si existen, sino usar defaults
  const getInitialTitle = () => title || DEFAULT_TITLE;
  const getInitialSubtitle = () => subtitle || DEFAULT_SUBTITLE;
  const getInitialFileUrl = () => fileUrl || DEFAULT_FILE_URL;

  // Estado local para los campos del formulario
  const [localTitle, setLocalTitle] = useState(getInitialTitle());
  const [localSubtitle, setLocalSubtitle] = useState(getInitialSubtitle());
  const [localFileUrl, setLocalFileUrl] = useState(getInitialFileUrl());
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar estado local cuando cambian los props
  useEffect(() => {
    const currentTitle = title || DEFAULT_TITLE;
    const currentSubtitle = subtitle || DEFAULT_SUBTITLE;
    const currentFileUrl = fileUrl || DEFAULT_FILE_URL;
    
    setLocalTitle(currentTitle);
    setLocalSubtitle(currentSubtitle);
    setLocalFileUrl(currentFileUrl);
    
    // Verificar si hay cambios respecto a los valores por defecto
    const changed = 
      currentTitle !== DEFAULT_TITLE ||
      currentSubtitle !== DEFAULT_SUBTITLE ||
      currentFileUrl !== DEFAULT_FILE_URL;
    setHasChanges(changed);
  }, [title, subtitle, fileUrl]);

  // Manejar guardar
  const handleSave = (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    const newErrors = {};
    if (!localTitle || localTitle.trim() === '') {
      newErrors.title = 'El título es obligatorio';
    }
    if (!localSubtitle || localSubtitle.trim() === '') {
      newErrors.subtitle = 'El subtítulo es obligatorio';
    }
    if (!localFileUrl || localFileUrl.trim() === '') {
      newErrors.fileUrl = 'La imagen del banner es obligatoria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Limpiar errores
    setErrors({});

    // Guardar en el store
    setTitle(localTitle);
    setSubtitle(localSubtitle);
    setFileUrl(localFileUrl);

    // Mostrar mensaje de éxito
    showSuccess('Banner Inicial guardado exitosamente');

    // Bloquear la sección después de guardar
    if (onSave) {
      onSave();
    }
  };

  // Manejar reestablecer a valores por defecto
  const handleReset = () => {
    setLocalTitle(DEFAULT_TITLE);
    setLocalSubtitle(DEFAULT_SUBTITLE);
    setLocalFileUrl(DEFAULT_FILE_URL);
    setErrors({});
    setHasChanges(false);
  };

  // Manejar cambio de archivo
  const handleFileSelect = async (file, base64File) => {
    if (!file || !base64File) {
      setLocalFileUrl('');
      return;
    }

    try {
      // Obtener la extensión del archivo
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Subir el archivo al endpoint
      const response = await saveBookClubFile(fileExtension, base64File);
      
      // Si la respuesta es exitosa, obtener la URL del archivo y actualizar estado local
      if (response.status === true && response.file_url) {
        setLocalFileUrl(response.file_url);
      } else {
        console.error('Error: No se recibió URL del servidor', response);
        // En caso de que no haya URL, mantener el base64 como fallback
        setLocalFileUrl(base64File);
      }
      
      if (errors.fileUrl) {
        setErrors(prev => ({ ...prev, fileUrl: null }));
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      // En caso de error, mantener el base64 como fallback
      setLocalFileUrl(base64File);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
            Banner Inicial
          </h2>
          <p className="text-gray-600 font-cabin-regular">
            Configura el banner principal del curso
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
        {/* Campos Título y Subtítulo en la misma línea */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Título *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiType className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="title"
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
                placeholder="Ej: Book Club"
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

          {/* Campo Subtítulo */}
          <div>
            <label htmlFor="subtitle" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Subtítulo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiType className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="subtitle"
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
                placeholder="Ej: Lectores"
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

        {/* Campo Imagen */}
        <div>
          <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Imagen del Banner *
          </label>
          <ImageUpload
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
            className="w-full"
            disabled={isLocked}
          />
          {errors.fileUrl && (
            <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.fileUrl}</p>
          )}
        </div>

        {/* Botones de acción - Solo mostrar si no está bloqueado */}
        {!isLocked && (
          <div className="flex items-center justify-start gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium flex items-center space-x-2"
            >
              <FiSave className="w-5 h-5" />
              <span>Guardar sección</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg transition-colors font-cabin-medium flex items-center space-x-2 ${
                hasChanges
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiRotateCcw className="w-4 h-4" />
              <span>Reestablecer valores por defecto</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default HeroSectionSection;

