import React, { useState, useEffect } from 'react';
import { FiX, FiGrid, FiEdit, FiSave, FiPlus } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';

const CategoryInformation = ({ category, isOpen, onClose, mode = 'view', onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    status: 'Activo'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Lista de iconos disponibles
  const availableIcons = [
    { value: '📚', label: '📚 Libro' },
    { value: '🧙‍♂️', label: '🧙‍♂️ Fantasía' },
    { value: '🗺️', label: '🗺️ Aventura' },
    { value: '🚀', label: '🚀 Ciencia Ficción' },
    { value: '🔍', label: '🔍 Misterio' },
    { value: '🐾', label: '🐾 Animales' },
    { value: '👨‍👩‍👧‍👦', label: '👨‍👩‍👧‍👦 Familiar' },
    { value: '⚽', label: '⚽ Deportes' },
    { value: '🎨', label: '🎨 Arte y Música' },
    { value: '🌿', label: '🌿 Naturaleza' },
    { value: '🎭', label: '🎭 Teatro' },
    { value: '🏰', label: '🏰 Castillo' },
    { value: '🌟', label: '🌟 Estrellas' },
    { value: '🌈', label: '🌈 Arcoíris' },
    { value: '🎪', label: '🎪 Circo' },
    { value: '🏖️', label: '🏖️ Playa' },
    { value: '🏔️', label: '🏔️ Montaña' },
    { value: '🌊', label: '🌊 Mar' },
    { value: '🦄', label: '🦄 Unicornio' },
    { value: '🐉', label: '🐉 Dragón' }
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '📚',
        status: category.status || 'Activo'
      });
      // Si el icono es una imagen (base64), establecerla como imagen subida
      if (category.icon && category.icon.startsWith('data:image/')) {
        setUploadedImage(category.icon);
      } else {
        setUploadedImage(null);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '📚',
        status: 'Activo'
      });
      setUploadedImage(null);
    }
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [category, mode]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => 
      file.type.startsWith('image/') && 
      (file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/jpeg')
    );
    
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setFormData(prev => ({
          ...prev,
          icon: event.target.result
        }));
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setFormData(prev => ({
          ...prev,
          icon: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const handleCancel = () => {
    if (mode === 'create') {
      onClose();
    } else {
      setIsEditing(false);
      // Restaurar datos originales
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || '📚',
          status: category.status || 'Activo'
        });
        // Restaurar imagen original
        if (category.icon && category.icon.startsWith('data:image/')) {
          setUploadedImage(category.icon);
        } else {
          setUploadedImage(null);
        }
      }
    }
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Crear Nueva Categoría';
    if (isEditing) return 'Editar Categoría';
    return 'Información de la Categoría';
  };

  const getModalSubtitle = () => {
    if (mode === 'create') return 'Agregar una nueva categoría al sistema';
    if (isEditing) return `Editando categoría "${category?.name || 'categoría'}"`;
    return `Detalles de la categoría "${category?.name || 'categoría'}"`;
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-[10000]">
        <div className="bg-white rounded-t-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                {mode === 'create' ? (
                  <FiPlus className="w-6 h-6 text-amber-600" />
                ) : (
                  <span className="text-2xl">
                    {formData.icon}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-cabin-bold text-gray-800">
                  {getModalTitle()}
                </h2>
                <p className="text-gray-600 font-cabin-regular">
                  {getModalSubtitle()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && mode !== 'create' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Información de la Categoría */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiGrid className="w-5 h-5 mr-2 text-amber-600" />
                Información de la Categoría
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el nombre de la categoría"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiGrid className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.name}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Icono</label>
                  {isEditing ? (
                    <div className="mt-1">
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${
                          isDragOver 
                            ? 'border-amber-500 bg-amber-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('icon-upload').click()}
                      >
                        <input
                          type="file"
                          accept=".png,.svg,.jpg,.jpeg"
                          onChange={handleFileInput}
                          className="hidden"
                          id="icon-upload"
                        />
                        {uploadedImage ? (
                          <div className="space-y-1">
                            <img 
                              src={uploadedImage} 
                              alt="Icono de categoría" 
                              className="w-12 h-12 mx-auto object-contain"
                            />
                            <p className="text-xs text-gray-600">Imagen subida</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600 font-cabin-medium">
                              Icono de categoría
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, SVG, JPG
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      {uploadedImage ? (
                        <img 
                          src={uploadedImage} 
                          alt="Icono de categoría" 
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <p className="font-cabin-semibold text-gray-800 flex items-center">
                          <span className="text-2xl mr-2">{formData.icon}</span>
                          {availableIcons.find(icon => icon.value === formData.icon)?.label.split(' ')[1] || 'Icono'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                  <label className="text-sm font-cabin-medium text-gray-600">Descripción</label>
                  {isEditing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular resize-none"
                      placeholder="Ingrese la descripción de la categoría"
                    />
                  ) : (
                    <p className="font-cabin-regular text-gray-700 mt-1">
                      {formData.description}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Estado</label>
                  {isEditing ? (
                    <div className="mt-1">
                      <CustomDropdown
                        options={[
                          { value: 'Activo', label: 'Activo' },
                          { value: 'Inactivo', label: 'Inactivo' }
                        ]}
                        selectedValues={[formData.status]}
                        onChange={(values) => handleInputChange('status', values[0])}
                        placeholder="Seleccionar estado"
                        className="w-full relative z-50"
                      />
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${
                        formData.status === 'Activo' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {formData.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-white rounded-b-xl">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-cabin-medium transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Cerrar'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-cabin-medium transition-colors flex items-center space-x-2"
              >
                <FiSave className="w-4 h-4" />
                <span>{mode === 'create' ? 'Crear' : 'Guardar'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryInformation; 