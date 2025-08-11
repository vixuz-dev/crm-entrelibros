import React, { useState, useEffect } from 'react';
import { FiX, FiPackage, FiEdit, FiSave, FiUser, FiMapPin, FiCalendar, FiDollarSign, FiTruck, FiCheckCircle, FiClock, FiAlertCircle, FiBook, FiPhone, FiMail } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';

const OrderInformation = ({ order, isOpen, onClose, mode = 'view', onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    customer: {
      name: '',
      email: '',
      phone: ''
    },
    products: [],
    total: 0,
    status: 'pendiente',
    orderDate: '',
    estimatedDelivery: '',
    actualDelivery: '',
    paymentMethod: '',
    shippingAddress: '',
    trackingNumber: '',
    urgency: 'normal',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        id: order.id || '',
        customer: {
          name: order.customer?.name || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || ''
        },
        products: order.products || [],
        total: order.total || 0,
        status: order.status || 'pendiente',
        orderDate: order.orderDate || '',
        estimatedDelivery: order.estimatedDelivery || '',
        actualDelivery: order.actualDelivery || '',
        paymentMethod: order.paymentMethod || '',
        shippingAddress: order.shippingAddress || '',
        trackingNumber: order.trackingNumber || '',
        urgency: order.urgency || 'normal',
        notes: order.notes || ''
      });
    } else {
      setFormData({
        id: '',
        customer: {
          name: '',
          email: '',
          phone: ''
        },
        products: [],
        total: 0,
        status: 'pendiente',
        orderDate: '',
        estimatedDelivery: '',
        actualDelivery: '',
        paymentMethod: '',
        shippingAddress: '',
        trackingNumber: '',
        urgency: 'normal',
        notes: ''
      });
    }
    setIsEditing(mode === 'edit');
  }, [order, mode]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
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
      if (order) {
        setFormData({
          id: order.id || '',
          customer: {
            name: order.customer?.name || '',
            email: order.customer?.email || '',
            phone: order.customer?.phone || ''
          },
          products: order.products || [],
          total: order.total || 0,
          status: order.status || 'pendiente',
          orderDate: order.orderDate || '',
          estimatedDelivery: order.estimatedDelivery || '',
          actualDelivery: order.actualDelivery || '',
          paymentMethod: order.paymentMethod || '',
          shippingAddress: order.shippingAddress || '',
          trackingNumber: order.trackingNumber || '',
          urgency: order.urgency || 'normal',
          notes: order.notes || ''
        });
      }
    }
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Crear Nuevo Pedido';
    if (isEditing) return 'Editar Pedido';
    return 'Información del Pedido';
  };

  const getModalSubtitle = () => {
    if (mode === 'create') return 'Agregar un nuevo pedido al sistema';
    if (isEditing) return `Editando pedido "${order?.id || 'pedido'}"`;
    return `Detalles del pedido "${order?.id || 'pedido'}"`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <FiClock className="w-5 h-5 text-yellow-600" />;
      case 'en_transito':
        return <FiTruck className="w-5 h-5 text-blue-600" />;
      case 'entregado':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelado':
        return <FiAlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiPackage className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en_transito':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'normal':
        return 'bg-gray-100 text-gray-800';
      case 'urgente':
        return 'bg-orange-100 text-orange-800';
      case 'critico':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const calculateTotal = () => {
    return formData.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
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
                {getStatusIcon(formData.status)}
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
            {/* Información del Pedido */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiPackage className="w-5 h-5 mr-2 text-amber-600" />
                Información del Pedido
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">ID del Pedido</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => handleInputChange('id', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el ID del pedido"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiPackage className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.id}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Estado</label>
                  {isEditing ? (
                    <div className="mt-1">
                      <CustomDropdown
                        options={[
                          { value: 'pendiente', label: 'Pendiente' },
                          { value: 'en_transito', label: 'En Tránsito' },
                          { value: 'entregado', label: 'Entregado' },
                          { value: 'cancelado', label: 'Cancelado' }
                        ]}
                        selectedValues={[formData.status]}
                        onChange={(values) => handleInputChange('status', values[0])}
                        placeholder="Seleccionar estado"
                        className="w-full relative z-50"
                      />
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(formData.status)}`}>
                        {formData.status === 'pendiente' && 'Pendiente'}
                        {formData.status === 'en_transito' && 'En Tránsito'}
                        {formData.status === 'entregado' && 'Entregado'}
                        {formData.status === 'cancelado' && 'Cancelado'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Urgencia</label>
                  {isEditing ? (
                    <div className="mt-1">
                      <CustomDropdown
                        options={[
                          { value: 'normal', label: 'Normal' },
                          { value: 'urgente', label: 'Urgente' },
                          { value: 'critico', label: 'Crítico' }
                        ]}
                        selectedValues={[formData.urgency]}
                        onChange={(values) => handleInputChange('urgency', values[0])}
                        placeholder="Seleccionar urgencia"
                        className="w-full relative z-50"
                      />
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium ${getUrgencyColor(formData.urgency)}`}>
                        {formData.urgency === 'normal' && 'Normal'}
                        {formData.urgency === 'urgente' && 'Urgente'}
                        {formData.urgency === 'critico' && 'Crítico'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Total</label>
                  <p className="font-cabin-semibold text-gray-800 flex items-center">
                    <FiDollarSign className="w-4 h-4 mr-2 text-gray-500" />
                    {formatPrice(formData.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2 text-amber-600" />
                Información del Cliente
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.customer.name}
                      onChange={(e) => handleInputChange('customer.name', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el nombre del cliente"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.customer.name}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.customer.email}
                      onChange={(e) => handleInputChange('customer.email', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el email del cliente"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiMail className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.customer.email}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.customer.phone}
                      onChange={(e) => handleInputChange('customer.phone', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el teléfono del cliente"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiPhone className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.customer.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Productos */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiBook className="w-5 h-5 mr-2 text-amber-600" />
                Productos ({formData.products.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {formData.products.length > 0 ? (
                  <div className="space-y-3">
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-3 flex-1">
                          <FiBook className="w-4 h-4 text-amber-600" />
                          <div className="flex-1">
                            <div className="font-cabin-medium text-gray-800">{product.title}</div>
                            <div className="text-sm text-gray-600">
                              Cantidad: {product.quantity} | Precio: {formatPrice(product.price)}
                            </div>
                          </div>
                        </div>
                        <div className="font-cabin-semibold text-gray-800">
                          {formatPrice(product.price * product.quantity)}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-3 border-t border-gray-200">
                      <div className="text-lg font-cabin-bold text-gray-800">
                        Total: {formatPrice(calculateTotal())}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 font-cabin-regular">
                    No hay productos en este pedido
                  </div>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiCalendar className="w-5 h-5 mr-2 text-amber-600" />
                Fechas
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Fecha de Pedido</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => handleInputChange('orderDate', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                      {formatDate(formData.orderDate)}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Entrega Estimada</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.estimatedDelivery}
                      onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                      {formatDate(formData.estimatedDelivery)}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Entrega Real</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.actualDelivery}
                      onChange={(e) => handleInputChange('actualDelivery', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.actualDelivery ? formatDate(formData.actualDelivery) : 'Pendiente'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Envío y Pago */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiTruck className="w-5 h-5 mr-2 text-amber-600" />
                Envío y Pago
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Método de Pago</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el método de pago"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiDollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.paymentMethod}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Número de Seguimiento</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.trackingNumber}
                      onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el número de seguimiento"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiTruck className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.trackingNumber || 'No disponible'}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Dirección de Envío</label>
                  {isEditing ? (
                    <textarea
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                      rows={2}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular resize-none"
                      placeholder="Ingrese la dirección de envío"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiMapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.shippingAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4">
                Notas
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {isEditing ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular resize-none"
                    placeholder="Ingrese notas adicionales sobre el pedido"
                  />
                ) : (
                  <p className="font-cabin-regular text-gray-700">
                    {formData.notes || 'No hay notas adicionales'}
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
                <span>Guardar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInformation; 