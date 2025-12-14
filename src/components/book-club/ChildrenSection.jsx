import React, { useState, useEffect } from 'react';
import { FiType, FiSave, FiEdit, FiImage, FiVideo, FiFileText, FiUser, FiCalendar, FiTag, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import ImageUpload from '../ui/ImageUpload';
import { saveBookClubFile } from '../../api/bookClubApi';
import { showSuccess, showError } from '../../utils/notifications';

const ChildrenSection = ({
  childrenSectionStories = [],
  addChildrenSectionStory,
  updateChildrenSectionStory,
  removeChildrenSectionStory,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  // Valores fijos por defecto
  const DEFAULT_CATEGORY = 'Cuento';
  const DEFAULT_AUTHOR = 'Rocío Fernandez';
  
  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Estado para controlar si se está mostrando el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [savingIndex, setSavingIndex] = useState(null);

  // Ocultar formulario si se bloquea la sección
  useEffect(() => {
    if (isLocked) {
      setShowForm(false);
      setEditingIndex(null);
    }
  }, [isLocked]);

  // Abrir formulario para nuevo cuento
  const handleAddStory = () => {
    if (isLocked) return;
    addChildrenSectionStory();
    const newIndex = childrenSectionStories.length;
    setEditingIndex(newIndex);
    setShowForm(true);
  };

  // Abrir formulario para editar cuento existente
  const handleEditStory = (index) => {
    if (isLocked) return;
    setEditingIndex(index);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  // Eliminar cuento
  const handleRemoveStory = (index, e) => {
    e.stopPropagation();
    if (isLocked) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar este cuento?')) {
      removeChildrenSectionStory(index);
      if (editingIndex === index) {
        handleCloseForm();
      }
    }
  };

  // Guardar cuento individual
  const handleSaveStory = async (index, story) => {
    if (isLocked) return;
    
    // Validar campos obligatorios
    const errors = {};
    if (!story.title || story.title.trim() === '') {
      errors.title = 'El título es obligatorio';
    }
    if (!story.thumbnail || story.thumbnail.trim() === '') {
      errors.thumbnail = 'La imagen miniatura es obligatoria';
    }
    if (!story.videoUrl || story.videoUrl.trim() === '') {
      errors.videoUrl = 'La URL del video es obligatoria';
    }
    if (!story.description || story.description.trim() === '') {
      errors.description = 'La descripción es obligatoria';
    }

    // Validar que la URL del video sea válida
    if (story.videoUrl && story.videoUrl.trim() !== '') {
      try {
        new URL(story.videoUrl);
      } catch {
        errors.videoUrl = 'La URL del video no es válida';
      }
    }

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n');
      showError(`Por favor, completa todos los campos obligatorios:\n${errorMessages}`);
      return;
    }

    setSavingIndex(index);

    try {
      // Si hay una imagen nueva (base64), subirla a S3
      let finalThumbnailUrl = story.thumbnail;
      if (story.thumbnail && story.thumbnail.startsWith('data:image')) {
        try {
          // Extraer el base64 y el tipo de archivo
          const matches = story.thumbnail.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
          if (matches) {
            const fileExtension = matches[1];
            const base64Data = matches[2];
            const response = await saveBookClubFile(fileExtension, base64Data);
            
            if (response.status === true && response.file_url) {
              finalThumbnailUrl = response.file_url;
            } else {
              throw new Error('Error al subir la imagen');
            }
          }
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          const errorMessage = error.response?.data?.status_Message || error.message || 'Error al subir la imagen';
          showError(`Error al subir la imagen: ${errorMessage}. Por favor, intenta de nuevo.`);
          setSavingIndex(null);
          return; // No cerrar el formulario si hay error
        }
      }

      // Actualizar el cuento en el store
      updateChildrenSectionStory(index, {
        ...story,
        thumbnail: finalThumbnailUrl,
        category: DEFAULT_CATEGORY,
        author: DEFAULT_AUTHOR,
        publishedDate: getTodayDate()
      });

      // Solo cerrar el formulario si todo fue exitoso
      showSuccess(`Cuento "${story.title}" guardado exitosamente`);
      handleCloseForm();
      
      // Si hay onSave, llamarlo para bloquear la sección
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      const errorMessage = error.response?.data?.status_Message || error.message || 'Error desconocido';
      showError(`Error al guardar el cuento: ${errorMessage}. Por favor, intenta de nuevo.`);
      // No cerrar el formulario si hay error
    } finally {
      setSavingIndex(null);
    }
  };

  // Componente para el formulario de un cuento individual
  const StoryForm = ({ story, index }) => {
    const [localStory, setLocalStory] = useState(story);
    const [errors, setErrors] = useState({});
    const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
    const [selectedThumbnailBase64, setSelectedThumbnailBase64] = useState(null);

    // Sincronizar cuando cambia el story desde props
    useEffect(() => {
      setLocalStory(story);
    }, [story]);

    const handleFieldChange = (field, value) => {
      setLocalStory(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: null }));
      }
    };

    const handleThumbnailSelect = (file, base64File) => {
      if (!file || !base64File) {
        handleFieldChange('thumbnail', '');
        setSelectedThumbnailFile(null);
        setSelectedThumbnailBase64(null);
        return;
      }
      setSelectedThumbnailFile(file);
      setSelectedThumbnailBase64(base64File);
      handleFieldChange('thumbnail', base64File);
    };

    const handleSave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleSaveStory(index, localStory);
    };

    return (
      <form onSubmit={handleSave} className="space-y-6">
        {/* Campo Título */}
        <div>
          <label htmlFor={`story-title-${index}`} className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Título *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiType className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id={`story-title-${index}`}
              type="text"
              value={localStory.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Ej: Moscas para merendar"
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

        {/* Grid: Categoría, Autor y Fecha de Publicación (solo lectura) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">Categoría</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={DEFAULT_CATEGORY}
                disabled
                readOnly
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-cabin-regular cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">Autor</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={DEFAULT_AUTHOR}
                disabled
                readOnly
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-cabin-regular cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">Fecha de Publicación</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={getTodayDate()}
                disabled
                readOnly
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-cabin-regular cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Campo Descripción */}
        <div>
          <label htmlFor={`story-description-${index}`} className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Descripción *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FiFileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id={`story-description-${index}`}
              value={localStory.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Ej: Floripondia Hop es una rana curiosa y muy hambrienta..."
              rows={6}
              disabled={isLocked}
              className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 resize-y ${
                errors.description ? 'border-red-500' : ''
              } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          {errors.description && (
            <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.description}</p>
          )}
        </div>

        {/* Grid: Imagen Miniatura y Video URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Imagen Miniatura (Thumbnail) *
            </label>
            <ImageUpload
              value={localStory.thumbnail || ''}
              onChange={(url) => handleFieldChange('thumbnail', url)}
              onFileSelect={isLocked ? undefined : handleThumbnailSelect}
              className="w-full"
              disabled={isLocked}
            />
            {errors.thumbnail && (
              <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.thumbnail}</p>
            )}
          </div>
          <div>
            <label htmlFor={`story-video-${index}`} className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              URL del Video *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiVideo className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id={`story-video-${index}`}
                type="url"
                value={localStory.videoUrl || ''}
                onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
                placeholder="https://ejemplo.com/video.mp4"
                disabled={isLocked}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
                  errors.videoUrl ? 'border-red-500' : 'border-gray-300'
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.videoUrl && (
              <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.videoUrl}</p>
            )}
            <p className="text-xs text-gray-500 font-cabin-regular mt-1">
              Ingresa la URL completa del video (no se permite subir archivos)
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        {!isLocked && (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg transition-colors font-cabin-medium hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingIndex === index}
              aria-label="Guardar cuento"
              className={`px-6 py-3 bg-amber-500 text-white rounded-lg transition-all duration-200 font-cabin-medium flex items-center space-x-2 transform ${
                savingIndex === index 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:bg-amber-600 hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {savingIndex === index ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>Guardar Cuento</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    );
  };

  // Componente para la card de un cuento guardado
  const StoryCard = ({ story, index }) => {
    const hasData = story.title && story.thumbnail && story.description;
    
    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group">
        {/* Botón eliminar (solo visible al hover) */}
        {!isLocked && (
          <button
            type="button"
            onClick={(e) => handleRemoveStory(index, e)}
            className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            title="Eliminar cuento"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
        
        {/* Click para editar */}
        <div
          onClick={() => !isLocked && handleEditStory(index)}
          className={`cursor-pointer ${!isLocked ? 'hover:bg-gray-50' : ''}`}
        >
          {hasData ? (
            <>
              {/* Thumbnail */}
              {story.thumbnail && (
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Sin+imagen';
                    }}
                  />
                </div>
              )}
              
              {/* Contenido */}
              <div className="p-4">
                <h3 className="text-lg font-cabin-bold text-gray-800 mb-2 line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-sm text-gray-600 font-cabin-regular line-clamp-3">
                  {story.description.replace(/<[^>]*>/g, '').substring(0, 120)}...
                </p>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-400 font-cabin-regular">Cuento sin completar</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente para el botón "Agregar cuento"
  const AddStoryButton = () => (
    <button
      type="button"
      onClick={handleAddStory}
      disabled={isLocked}
      aria-label="Agregar nuevo cuento"
      className="w-full h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-3 hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
        <FiPlus className="w-8 h-8 text-amber-600" />
      </div>
      <span className="text-gray-700 font-cabin-semibold">Agregar cuento</span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
            Sección para niños
          </h2>
          <p className="text-gray-700 font-cabin-regular">
            Configura los video cuentos para niños. Puedes agregar múltiples cuentos.
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

      {/* Formulario (se muestra cuando showForm es true) */}
      {showForm && editingIndex !== null && childrenSectionStories[editingIndex] && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-amber-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-cabin-bold text-gray-800">
              {editingIndex === childrenSectionStories.length - 1 && !childrenSectionStories[editingIndex].title
                ? 'Nuevo Cuento'
                : `Editar: ${childrenSectionStories[editingIndex].title || 'Cuento sin título'}`}
            </h3>
            {!isLocked && (
              <button
                type="button"
                onClick={handleCloseForm}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
          <StoryForm story={childrenSectionStories[editingIndex]} index={editingIndex} />
        </div>
      )}

      {/* Grid de cuentos */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards de cuentos guardados */}
          {childrenSectionStories.map((story, index) => {
            const hasData = story.title && story.title.trim() !== '' && 
                           story.videoUrl && story.videoUrl.trim() !== '';
            // Solo mostrar cards que tienen datos completos
            if (!hasData) return null;
            return <StoryCard key={story.id || index} story={story} index={index} />;
          })}
          
          {/* Botón agregar cuento (solo si no está bloqueado) - Siempre visible */}
          {!isLocked && (
            <div className={childrenSectionStories.filter(s => s.title && s.title.trim() !== '' && s.videoUrl && s.videoUrl.trim() !== '').length === 0 ? 'flex justify-center' : ''}>
              <div className={childrenSectionStories.filter(s => s.title && s.title.trim() !== '' && s.videoUrl && s.videoUrl.trim() !== '').length === 0 ? 'w-full max-w-md' : 'w-full'}>
                <AddStoryButton />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChildrenSection;
