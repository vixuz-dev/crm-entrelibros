import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiSave, FiPlus, FiShield } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';

const ClientInformation = ({ client, isOpen, onClose, mode = 'view', onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    status: 'Activo',
    joinDate: '',
    lastLogin: '',
    totalOrders: 0,
    totalSpent: 0,
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
        country: client.country || '',
        status: client.status === 1 ? 'Activo' : client.status === 0 ? 'Inactivo' : 'Activo',
        joinDate: client.joinDate || '',
        lastLogin: client.lastLogin || '',
        totalOrders: client.totalOrders || 0,
        totalSpent: client.totalSpent || 0,
        notes: client.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        status: 'Activo',
        joinDate: '',
        lastLogin: '',
        totalOrders: 0,
        totalSpent: 0,
        notes: ''
      });
    }
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [client, mode]);

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
      if (client) {
        setFormData({
          name: client.name || '',
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          city: client.city || '',
          state: client.state || '',
          zipCode: client.zipCode || '',
          country: client.country || '',
          status: client.status === 1 ? 'Activo' : client.status === 0 ? 'Inactivo' : 'Activo',
          joinDate: client.joinDate || '',
          lastLogin: client.lastLogin || '',
          totalOrders: client.totalOrders || 0,
          totalSpent: client.totalSpent || 0,
          notes: client.notes || ''
        });
      }
    }
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Crear Nuevo Cliente';
    if (isEditing) return 'Editar Cliente';
    return 'Información del Cliente';
  };

  const getModalSubtitle = () => {
    if (mode === 'create') return 'Agregar un nuevo cliente al sistema';
    if (isEditing) return `Editando información de ${client?.name || 'cliente'}`;
    return `Detalles completos de ${client?.name || 'cliente'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
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
        <div className="bg-white rounded-t-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                {mode === 'create' ? (
                  <FiPlus className="w-6 h-6 text-amber-600" />
                ) : (
                  <span className="text-amber-600 font-cabin-bold text-lg">
                    {client?.name?.split(' ').map(n => n[0]).join('') || 'C'}
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
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2 text-amber-600" />
                Información Personal
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Nombre Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el nombre completo"
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
                  <label className="text-sm font-cabin-medium text-gray-600">Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el teléfono"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiPhone className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.phone}
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
                          { value: 'Inactivo', label: 'Inactivo' },
                          { value: 'Suspendido', label: 'Suspendido' }
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
                          : formData.status === 'Inactivo'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {formData.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiMapPin className="w-5 h-5 mr-2 text-amber-600" />
                Dirección
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Dirección</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese la dirección"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiMapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.address || 'No especificada'}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Ciudad</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese la ciudad"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800">
                      {formData.city || 'No especificada'}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Estado/Provincia</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el estado"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800">
                      {formData.state || 'No especificado'}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Código Postal</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el código postal"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800">
                      {formData.zipCode || 'No especificado'}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">País</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el país"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800">
                      {formData.country || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Actividad */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiCalendar className="w-5 h-5 mr-2 text-amber-600" />
                Información de Actividad
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Fecha de Registro</label>
                  <p className="font-cabin-semibold text-gray-800 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                    {formatDate(formData.joinDate)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Último Acceso</label>
                  <p className="font-cabin-semibold text-gray-800 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                    {formatDate(formData.lastLogin)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Total de Pedidos</label>
                  <p className="font-cabin-semibold text-gray-800">
                    {formData.totalOrders} pedidos
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Total Gastado</label>
                  <p className="font-cabin-semibold text-gray-800">
                    {formatPrice(formData.totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiShield className="w-5 h-5 mr-2 text-amber-600" />
                Notas Adicionales
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {isEditing ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                    placeholder="Agregar notas sobre el cliente..."
                    rows="3"
                  />
                ) : (
                  <p className="font-cabin-regular text-gray-800">
                    {formData.notes || 'Sin notas adicionales'}
                  </p>
                )}
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

export default ClientInformation; 