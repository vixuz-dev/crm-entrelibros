import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiShield, FiEdit, FiSave, FiPlus } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';

const UserInformation = ({ user, isOpen, onClose, mode = 'view', onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Admin',
    status: 'Activo'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Admin',
        status: user.status || 'Activo'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Admin',
        status: 'Activo'
      });
    }
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [user, mode]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'Admin',
          status: user.status || 'Activo'
        });
      }
    }
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Crear Nuevo Usuario';
    if (isEditing) return 'Editar Usuario';
    return 'Información del Usuario';
  };

  const getModalSubtitle = () => {
    if (mode === 'create') return 'Agregar un nuevo usuario al sistema';
    if (isEditing) return `Editando información de ${user?.name || 'usuario'}`;
    return `Detalles completos de ${user?.name || 'usuario'}`;
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
        <div className="bg-white rounded-t-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                {mode === 'create' ? (
                  <FiPlus className="w-6 h-6 text-amber-600" />
                ) : (
                  <span className="text-amber-600 font-cabin-bold text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
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
            {/* Información del Usuario */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2 text-amber-600" />
                Información del Usuario
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
                      placeholder="Ingrese el nombre"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.name}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Correo Electrónico</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el correo electrónico"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiMail className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.email}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Rol</label>
                  {isEditing ? (
                    <div className="mt-1">
                      <CustomDropdown
                        options={[
                          { value: 'Admin', label: 'Admin' },
                          { value: 'Editor', label: 'Editor' },
                          { value: 'Viewer', label: 'Viewer' }
                        ]}
                        selectedValues={[formData.role]}
                        onChange={(values) => handleInputChange('role', values[0])}
                        placeholder="Seleccionar rol"
                        className="w-full relative z-50"
                      />
                    </div>
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiShield className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.role}
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

export default UserInformation; 