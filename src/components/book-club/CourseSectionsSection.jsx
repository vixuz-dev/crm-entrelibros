import React, { useState, useEffect } from 'react';
import { FiType, FiSave, FiEdit } from 'react-icons/fi';
import FileUpload from '../ui/FileUpload';
import { saveBookClubFile } from '../../api/bookClubApi';
import { showSuccess } from '../../utils/notifications';

const CourseSectionsSection = ({
  monthlyActivityTitle,
  setMonthlyActivityTitle,
  monthlyActivityDescription,
  setMonthlyActivityDescription,
  monthlyActivityFileUrl,
  setMonthlyActivityFileUrl,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  const DEFAULT_TITLE = 'Actividad del mes';

  const [localTitle, setLocalTitle] = useState(monthlyActivityTitle || DEFAULT_TITLE);
  const [localDescription, setLocalDescription] = useState(monthlyActivityDescription || '');
  const [localFileUrl, setLocalFileUrl] = useState(monthlyActivityFileUrl || '');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState(null);

  useEffect(() => {
    setLocalTitle(monthlyActivityTitle || DEFAULT_TITLE);
  }, [monthlyActivityTitle]);

  useEffect(() => {
    setLocalDescription(monthlyActivityDescription || '');
  }, [monthlyActivityDescription]);

  useEffect(() => {
    setLocalFileUrl(monthlyActivityFileUrl || '');
  }, [monthlyActivityFileUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!localTitle || localTitle.trim() === '') {
      newErrors.title = 'El título es obligatorio';
    }
    if (!localDescription || localDescription.trim() === '') {
      newErrors.description = 'La descripción es obligatoria';
    }
    if (!selectedFile && !selectedFileBase64 && (!localFileUrl || localFileUrl.trim() === '')) {
      newErrors.fileUrl = 'El archivo es obligatorio';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      let finalFileUrl = localFileUrl;

      if (selectedFile && selectedFileBase64) {
        try {
          const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
          const response = await saveBookClubFile(fileExtension, selectedFileBase64);

          if (response.status === true && response.file_url) {
            finalFileUrl = response.file_url;
          } else {
            const errorMessage = response.status_Message || 'Error al subir el archivo';
            setErrors({ fileUrl: errorMessage });
            setIsSaving(false);
            return;
          }
        } catch (error) {
          const errorMessage = error.response?.data?.status_Message || error.message || 'Error al subir el archivo';
          setErrors({ fileUrl: errorMessage });
          setIsSaving(false);
          return;
        }
      }

      setMonthlyActivityTitle(localTitle.trim());
      setMonthlyActivityDescription(localDescription.trim());
      setMonthlyActivityFileUrl(finalFileUrl);
      setSelectedFile(null);
      setSelectedFileBase64(null);
      showSuccess('Actividad del Mes guardada exitosamente');

      const button = document.activeElement;
      if (button && button.type === 'submit') {
        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 1000);
      }

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

    setSelectedFile(file);
    setSelectedFileBase64(base64File);
    setLocalFileUrl(base64File);

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
            Título, descripción y archivo descargable
          </p>
        </div>
        {isLocked && showEditButton && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar Actividad del Mes"
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 font-cabin-medium transform hover:scale-105 active:scale-95"
          >
            <FiEdit className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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
                if (!isLocked) {
                  setLocalTitle(e.target.value);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: null }));
                  }
                }
              }}
              placeholder="Ej: Actividad del mes"
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
          <label htmlFor="monthlyActivityDescription" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            id="monthlyActivityDescription"
            value={localDescription}
            onChange={(e) => {
              if (!isLocked) {
                setLocalDescription(e.target.value);
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: null }));
                }
              }
            }}
            placeholder="Describe el contenido de la actividad..."
            disabled={isLocked}
            rows={4}
            className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Archivo descargable *
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
            accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,image/jpg"
            allowedExtensions={['pdf', 'jpg', 'jpeg', 'png', 'webp']}
            maxSize={50 * 1024 * 1024}
            fileTypeLabel="Actividad"
            className="w-full"
            disabled={isLocked}
          />
          {errors.fileUrl && (
            <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.fileUrl}</p>
          )}
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-cabin-regular">{errors.general}</p>
          </div>
        )}

        {!isLocked && (
          <div className="flex items-center justify-start pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaving}
              aria-label="Guardar Actividad del Mes"
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
                  <span>Guardar sección</span>
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
