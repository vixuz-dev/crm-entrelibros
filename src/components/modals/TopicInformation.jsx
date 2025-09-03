import React, { useState, useEffect } from 'react';
import { FiX, FiGrid, FiSave, FiEdit3 } from 'react-icons/fi';

const TopicInformation = ({ 
  topic, 
  isOpen, 
  onClose, 
  mode = 'view', 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    topic_name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or topic changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setFormData({ topic_name: '' });
        setErrors({});
      } else if (topic) {
        setFormData({
          topic_name: topic.topic_name || ''
        });
        setErrors({});
      }
    }
  }, [isOpen, topic, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.topic_name.trim()) {
      newErrors.topic_name = 'El nombre del tema es requerido';
    } else if (formData.topic_name.trim().length < 2) {
      newErrors.topic_name = 'El nombre del tema debe tener al menos 2 caracteres';
    } else if (formData.topic_name.trim().length > 100) {
      newErrors.topic_name = 'El nombre del tema no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving topic:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiGrid className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-cabin-bold text-gray-800">
                {isCreateMode && 'Nuevo Tema'}
                {isEditMode && 'Editar Tema'}
                {isViewMode && 'Información del Tema'}
              </h2>
              <p className="text-sm text-gray-600 font-cabin-regular">
                {isCreateMode && 'Agregar un nuevo tema al sistema'}
                {isEditMode && 'Modificar información del tema'}
                {isViewMode && 'Detalles del tema'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isViewMode ? (
            // View Mode
            <div className="space-y-4">
              <div>
                <label className="text-sm font-cabin-medium text-gray-600 mb-2 block">
                  Nombre del Tema
                </label>
                <p className="text-lg font-cabin-semibold text-gray-800">
                  {topic?.topic_name || 'N/A'}
                </p>
              </div>
              
              {topic?.topic_id && (
                <div>
                  <label className="text-sm font-cabin-medium text-gray-600 mb-2 block">
                    ID del Tema
                  </label>
                  <p className="text-lg font-cabin-semibold text-gray-800">
                    #{topic.topic_id}
                  </p>
                </div>
              )}
              
              {topic?.status !== undefined && (
                <div>
                  <label className="text-sm font-cabin-medium text-gray-600 mb-2 block">
                    Estado
                  </label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-cabin-medium border ${
                    topic.status === true || topic.status === 1
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {topic.status === true || topic.status === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
              
              {topic?.created_at && (
                <div>
                  <label className="text-sm font-cabin-medium text-gray-600 mb-2 block">
                    Fecha de Creación
                  </label>
                  <p className="text-lg font-cabin-semibold text-gray-800">
                    {new Date(topic.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Edit/Create Mode
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="topic_name" className="text-sm font-cabin-medium text-gray-600 mb-2 block">
                  Nombre del Tema *
                </label>
                <input
                  type="text"
                  id="topic_name"
                  name="topic_name"
                  value={formData.topic_name}
                  onChange={handleInputChange}
                  placeholder="Ingresa el nombre del tema"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular transition-colors ${
                    errors.topic_name 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.topic_name && (
                  <p className="text-red-500 text-sm font-cabin-regular mt-1">
                    {errors.topic_name}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-cabin-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-cabin-medium flex items-center justify-center sm:justify-start space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      {isCreateMode ? <FiSave className="w-4 h-4" /> : <FiEdit3 className="w-4 h-4" />}
                      <span>{isCreateMode ? 'Crear Tema' : 'Guardar Cambios'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicInformation;
