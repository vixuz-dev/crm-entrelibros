import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiShield, FiEdit, FiSave, FiPlus, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';
import { encryptPassword } from '../../utils/encryption';

const UserInformation = ({ user, isOpen, onClose, mode = 'view', onSave }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    user_paternal_lastname: '',
    user_maternal_lastname: '',
    user_phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && mode !== 'create') {
      setFormData({
        user_name: user.user_name || user.name || '',
        user_email: user.user_email || user.email || '',
        user_password: '',
        user_paternal_lastname: user.user_paternal_lastname || user.paternal_lastname || '',
        user_maternal_lastname: user.user_maternal_lastname || user.maternal_lastname || '',
        user_phone: user.user_phone || user.phone || ''
      });
    } else {
      setFormData({
        user_name: '',
        user_email: '',
        user_password: '',
        user_paternal_lastname: '',
        user_maternal_lastname: '',
        user_phone: ''
      });
    }
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [user, mode]);

  // Limpiar estado cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Función para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar teléfono (10 dígitos)
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validar en tiempo real
    if (field === 'user_email' && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, user_email: 'Formato de email inválido' }));
      } else {
        setErrors(prev => ({ ...prev, user_email: null }));
      }
    }

    if (field === 'user_phone' && value) {
      if (!validatePhone(value)) {
        setErrors(prev => ({ ...prev, user_phone: 'El teléfono debe tener exactamente 10 dígitos' }));
      } else {
        setErrors(prev => ({ ...prev, user_phone: null }));
      }
    }

    // Limpiar error si el campo está vacío
    if (field === 'user_email' && !value) {
      setErrors(prev => ({ ...prev, user_email: null }));
    }
    if (field === 'user_phone' && !value) {
      setErrors(prev => ({ ...prev, user_phone: null }));
    }
  };

  const handleSave = async () => {
    try {
      // Validar campos antes de guardar
      const newErrors = {};

      // Validar email si está presente
      if (formData.user_email && !validateEmail(formData.user_email)) {
        newErrors.user_email = 'Formato de email inválido';
      }

      // Validar teléfono si está presente
      if (formData.user_phone && !validatePhone(formData.user_phone)) {
        newErrors.user_phone = 'El teléfono debe tener exactamente 10 dígitos';
      }

      // Si hay errores, mostrarlos y no continuar
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      if (mode === 'create') {
        // Validar campos requeridos para crear usuario
        if (!formData.user_email || !formData.user_password || !formData.user_name) {
          alert('Por favor completa los campos requeridos: Email, Contraseña y Nombre');
          return;
        }

        // Encriptar contraseña antes de enviar
        const userDataToSave = {
          ...formData,
          user_password: encryptPassword(formData.user_password)
        };

        if (onSave) {
          await onSave(userDataToSave);
        }
      } else {
        // Para edición, no encriptar contraseña si está vacía
        const userDataToSave = { ...formData };
        if (formData.user_password) {
          userDataToSave.user_password = encryptPassword(formData.user_password);
        } else {
          delete userDataToSave.user_password;
        }

        if (onSave) {
          await onSave(userDataToSave);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar el usuario. Por favor intenta de nuevo.');
    }
  };

  const handleCancel = () => {
    setErrors({});
    
    if (mode === 'create') {
      onClose();
    } else if (mode === 'edit') {
      onClose();
    } else if (isEditing) {
      onClose();
    } else {
      onClose();
    }
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Crear Nuevo Usuario';
    if (isEditing) return 'Editar Usuario';
    return 'Información del Usuario';
  };

  const getModalSubtitle = () => {
    if (mode === 'create') return 'Agregar un nuevo usuario administrador del sistema';
    if (isEditing) return `Editando información de ${user?.user_name || user?.name || 'usuario'}`;
    return `Detalles completos de ${user?.user_name || user?.name || 'usuario'}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => {
          onClose();
        }}
        style={{ cursor: 'pointer' }}
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
                onClick={() => {
                  onClose();
                }}
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
                {/* Nombre */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.user_name}
                      onChange={(e) => handleInputChange('user_name', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el nombre"
                      required
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.user_name || 'No especificado'}
                    </p>
                  )}
                </div>

                {/* Apellido Paterno */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Apellido Paterno</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.user_paternal_lastname}
                      onChange={(e) => handleInputChange('user_paternal_lastname', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el apellido paterno"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.user_paternal_lastname || 'No especificado'}
                    </p>
                  )}
                </div>

                {/* Apellido Materno */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Apellido Materno</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.user_maternal_lastname}
                      onChange={(e) => handleInputChange('user_maternal_lastname', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el apellido materno"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.user_maternal_lastname || 'No especificado'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        value={formData.user_email}
                        onChange={(e) => handleInputChange('user_email', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular ${
                          errors.user_email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingrese el correo electrónico"
                        required
                      />
                      {errors.user_email && (
                        <p className="text-red-500 text-sm mt-1 font-cabin-regular">
                          {errors.user_email}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiMail className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.user_email}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                {(mode === 'create' || isEditing) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-cabin-medium text-gray-600">
                      Contraseña {mode === 'create' && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.user_password}
                        onChange={(e) => handleInputChange('user_password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                        placeholder={mode === 'create' ? 'Ingrese la contraseña' : 'Dejar vacío para no cambiar'}
                        required={mode === 'create'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-5 h-5" />
                        ) : (
                          <FiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Teléfono */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Teléfono</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        value={formData.user_phone}
                        onChange={(e) => handleInputChange('user_phone', e.target.value)}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular ${
                          errors.user_phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingrese el número de teléfono (10 dígitos)"
                        maxLength="10"
                      />
                      {errors.user_phone && (
                        <p className="text-red-500 text-sm mt-1 font-cabin-regular">
                          {errors.user_phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiPhone className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.user_phone || 'No especificado'}
                    </p>
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