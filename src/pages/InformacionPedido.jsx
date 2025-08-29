import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiUser, 
  FiMapPin, 
  FiDollarSign, 
  FiCalendar, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiShoppingCart,
  FiRefreshCw,
  FiAlertCircle,
  FiCreditCard,
  FiHome,
  FiMail,
  FiPhone,
  FiTag,
  FiBook,
  FiHash
} from 'react-icons/fi';
import { getOrderDetail, changeOrderSentStatus } from '../api/orders';
import { showDataLoadError, showDataLoadSuccess, showOrderStatusChanged, showOrderStatusError } from '../utils/notifications';
import placeholderImage from '../assets/images/placeholder.jpg';

const InformacionPedido = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getOrderDetail(parseInt(orderId));
      
      if (response.status === true) {
        setOrder(response.order);
        // showDataLoadSuccess('detalles de la orden', 1);
      } else {
        setError(response.status_Message || 'Error al cargar los detalles de la orden');
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      const errorMessage = error.response?.data?.status_Message || 'Error al cargar los detalles de la orden';
      setError(errorMessage);
      showDataLoadError('detalles de la orden', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeOrderStatus = async () => {
    if (!order || isChangingStatus) return;
    
    try {
      setIsChangingStatus(true);
      
      const response = await changeOrderSentStatus(order.order_id);
      
      if (response.status === true) {
        // Actualizar el estado local de la orden
        setOrder(prevOrder => ({
          ...prevOrder,
          was_sent: prevOrder.was_sent === 1 ? 0 : 1
        }));
        
        const newStatus = order.was_sent === 1 ? 'Pendiente' : 'Entregado';
        showOrderStatusChanged(newStatus);
      } else {
        const errorMessage = response.status_Message || 'Error al cambiar el estado de la orden';
        showOrderStatusError(errorMessage);
      }
    } catch (error) {
      console.error('Error changing order status:', error);
      const errorMessage = error.response?.data?.status_Message || 'Error al cambiar el estado de la orden';
      showOrderStatusError(errorMessage);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Pago exitoso':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Fallido':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'Pago exitoso':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'Pendiente':
        return <FiClock className="w-4 h-4" />;
      case 'Fallido':
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return <FiCreditCard className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cabin-medium">Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-cabin-bold text-gray-800 mb-2">Error al cargar la orden</h2>
          <p className="text-gray-600 font-cabin-regular mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/pedidos')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-cabin-medium"
            >
              Volver a Pedidos
            </button>
            <button
              onClick={loadOrderDetail}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-cabin-medium flex items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-cabin-medium">Orden no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/pedidos')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-cabin-bold text-gray-800">
                  Orden #{order.folio}
                </h1>
                <p className="text-gray-600 font-cabin-regular">
                  Detalles completos de la orden
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadOrderDetail}
                className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Actualizar"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen de la Orden */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-cabin-bold text-gray-800 flex items-center">
                  <FiPackage className="w-6 h-6 mr-3 text-amber-600" />
                  Resumen de la Orden
                </h2>
                <div className="flex items-center space-x-2">
                  {getPaymentStatusIcon(order.payment_status)}
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-cabin-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Folio</label>
                    <p className="text-lg font-cabin-semibold text-gray-800">{order.folio}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Fecha de Creación</label>
                    <p className="text-lg font-cabin-semibold text-gray-800">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Última Actualización</label>
                    <p className="text-lg font-cabin-semibold text-gray-800">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Subtotal</label>
                    <p className="text-lg font-cabin-semibold text-gray-800">{formatPrice(order.subtotal)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Costo de Envío</label>
                    <p className="text-lg font-cabin-semibold text-gray-800">{formatPrice(order.shipping_cost)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Total</label>
                    <p className="text-2xl font-cabin-bold text-amber-600">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-cabin-bold text-gray-800 flex items-center mb-6">
                <FiShoppingCart className="w-6 h-6 mr-3 text-amber-600" />
                Productos ({order.products.length})
              </h2>
              
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={product.main_image_url || placeholderImage}
                          alt={product.product_name}
                          className="w-16 h-16 rounded-lg object-cover shadow-sm"
                          onError={(e) => {
                            e.target.src = placeholderImage;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-cabin-semibold text-gray-800 mb-1">
                              {product.product_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {product.categories.map((category, catIndex) => (
                                <span key={catIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-cabin-medium bg-blue-100 text-blue-800">
                                  <FiTag className="w-3 h-3 mr-1" />
                                  {category}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {product.topics.map((topic, topicIndex) => (
                                <span key={topicIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-cabin-medium bg-purple-100 text-purple-800">
                                  <FiBook className="w-3 h-3 mr-1" />
                                  {topic}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {product.authors.map((author, authorIndex) => (
                                <span key={authorIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-cabin-medium bg-green-100 text-green-800">
                                  <FiUser className="w-3 h-3 mr-1" />
                                  {author}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm text-gray-600 mb-1">
                              Cantidad: {product.quantity}
                            </div>
                            <div className="text-lg font-cabin-bold text-amber-600">
                              {formatPrice(product.sale_price)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Subtotal: {formatPrice(product.subtotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-cabin-bold text-gray-800 flex items-center mb-6">
                <FiUser className="w-6 h-6 mr-3 text-amber-600" />
                Información del Cliente
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiUser className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-cabin-medium text-gray-600">Nombre</p>
                    <p className="font-cabin-semibold text-gray-800">{order.contact_information.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-cabin-medium text-gray-600">Email</p>
                    <p className="font-cabin-semibold text-gray-800">{order.contact_information.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-cabin-medium text-gray-600">Teléfono</p>
                    <p className="font-cabin-semibold text-gray-800">{order.contact_information.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección de Envío */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-cabin-bold text-gray-800 flex items-center mb-6">
                <FiMapPin className="w-6 h-6 mr-3 text-amber-600" />
                Dirección de Envío
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-cabin-medium text-gray-600">Calle y Número</p>
                  <p className="font-cabin-semibold text-gray-800">
                    {order.address.street} {order.address.external_number}
                    {order.address.internal_number && ` Int. ${order.address.internal_number}`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-cabin-medium text-gray-600">Colonia</p>
                  <p className="font-cabin-semibold text-gray-800">{order.address.neighborhood}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-cabin-medium text-gray-600">Ciudad</p>
                    <p className="font-cabin-semibold text-gray-800">{order.address.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-cabin-medium text-gray-600">Estado</p>
                    <p className="font-cabin-semibold text-gray-800">{order.address.state}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-cabin-medium text-gray-600">Código Postal</p>
                  <p className="font-cabin-semibold text-gray-800">{order.address.postal_code}</p>
                </div>
              </div>
            </div>

            {/* Estado de Envío */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-cabin-bold text-gray-800 flex items-center mb-6">
                <FiTruck className="w-6 h-6 mr-3 text-amber-600" />
                Estado de Envío
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-cabin-medium text-gray-600">Estado Actual</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-cabin-medium ${
                    order.was_sent === 1 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {order.was_sent === 1 ? (
                      <>
                        <FiCheckCircle className="w-4 h-4 mr-1" />
                        Entregado
                      </>
                    ) : (
                      <>
                        <FiClock className="w-4 h-4 mr-1" />
                        Pendiente
                      </>
                    )}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleChangeOrderStatus}
                    disabled={isChangingStatus}
                    className={`w-full px-4 py-3 rounded-lg font-cabin-medium transition-colors flex items-center justify-center space-x-2 ${
                      isChangingStatus
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : order.was_sent === 1
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isChangingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Cambiando estado...</span>
                      </>
                    ) : (
                      <>
                        {order.was_sent === 1 ? (
                          <>
                            <FiClock className="w-4 h-4" />
                            <span>Marcar como Pendiente</span>
                          </>
                        ) : (
                          <>
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Marcar como Entregado</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    ID de Dirección: {order.address.destiny_address_id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacionPedido;
