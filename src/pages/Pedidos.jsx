import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiPackage, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiShoppingCart,
  FiRefreshCw
} from 'react-icons/fi';
import OrderChart from '../components/charts/OrderChart';
import CustomDropdown from '../components/ui/CustomDropdown';
import Pagination from '../components/ui/Pagination';
import { useOrdersInformation } from '../store/useOrdersInformation';
import { ROUTES } from '../utils/routes';

const Pedidos = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Store de órdenes
  const {
    orders,
    currentPage,
    totalPages,
    totalOrders,
    totalPendingOrder,
    totalDeliveryOrders,
    limit,
    isLoading,
    error,
    isInitialized,
    loadOrders,
    refreshOrders,
    goToPage,
    changeLimit
  } = useOrdersInformation();

  // Cargar órdenes al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      loadOrders();
    }
  }, [isInitialized]);

  // Detectar si viene de una acción rápida para crear nuevo pedido
  useEffect(() => {
    if (location.pathname === ROUTES.ORDERS_CREATE) {
      // TODO: Implementar creación de pedido
  
    }
  }, [location.pathname]);

  // Datos para gráficos usando datos reales del store
  const orderStatusData = {
    labels: ['Pendientes', 'Entregados'],
    datasets: [
      {
        data: [
          totalPendingOrder,
          totalDeliveryOrders
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Función para generar datos de tendencia basados en órdenes reales
  const generateTrendData = () => {
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const ordersByDay = [0, 0, 0, 0, 0, 0, 0]; // Inicializar contadores para cada día
    
    // Procesar órdenes reales para contar por día de la semana
    orders.forEach(order => {
      if (order.created_at) {
        const orderDate = new Date(order.created_at);
        const dayOfWeek = orderDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        // Convertir a nuestro formato (0 = Lunes, 6 = Domingo)
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        ordersByDay[adjustedDay]++;
      }
    });

    return {
      labels: daysOfWeek,
      datasets: [
        {
          label: 'Pedidos Recibidos',
          data: ordersByDay,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const orderTrendData = generateTrendData();

  // Funciones de utilidad
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <FiClock className="w-4 h-4" />;
      case 'en_transito':
        return <FiTruck className="w-4 h-4" />;
      case 'entregado':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelado':
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return <FiPackage className="w-4 h-4" />;
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
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Función para determinar el estado del pedido basado en was_sent
  const getOrderStatus = (order) => {
    if (order.was_sent === 1) {
      return {
        status: 'enviado',
        label: 'Enviado',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <FiTruck className="w-4 h-4" />
      };
    } else {
      return {
        status: 'pendiente',
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <FiClock className="w-4 h-4" />
      };
    }
  };

  // Funciones de manejo
  const handleViewOrder = (order) => {
    // Redirigir a la página de información de la orden
    window.location.href = `/pedidos/informacion?orderId=${order.order_id}`;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDateRange('todos');
    setSelectedStatus('all');
  };

  // Función para verificar si una fecha está en el rango seleccionado
  const isDateInRange = (dateString) => {
    if (!dateString) return false;
    
    const orderDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (selectedDateRange) {
      case 'hoy':
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);
        return orderDay.getTime() === today.getTime();
        
      case 'semana':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return orderDate >= weekAgo && orderDate <= today;
        
      case 'mes':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return orderDate >= monthAgo && orderDate <= today;
        
      case 'todos':
      default:
        return true;
    }
  };

  // Filtrado de pedidos
  const filteredOrders = orders.filter(order => {
    // Filtrar órdenes con payment_status "Pendiente de pago"
    if (order.payment_status === "Pendiente de pago") {
      return false;
    }
    
    const matchesSearch = 
      order.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact_information?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact_information?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por fecha si se selecciona
    if (!isDateInRange(order.created_at)) {
      return false;
    }
    
    // Filtrar por estado si se selecciona
    if (selectedStatus !== 'all') {
      const orderStatus = getOrderStatus(order);
      if (selectedStatus === 'pending' && orderStatus.status !== 'pendiente') {
        return false;
      }
      if (selectedStatus === 'sent' && orderStatus.status !== 'enviado') {
        return false;
      }
    }
    
    return matchesSearch;
  });

  // Cálculo de métricas usando datos del store
  const totalValue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const averageDeliveryTime = 5.2; // días promedio

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Pedidos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Administra todos los pedidos del sistema
          </p>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Pedidos Pendientes - Destacado */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-lg p-4 lg:p-6 relative overflow-hidden sm:col-span-2 lg:col-span-1">
          {/* Highlight indicator */}
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] lg:border-l-[60px] border-l-transparent border-t-[40px] lg:border-t-[60px] border-t-yellow-400"></div>
          <div className="absolute top-2 right-2">
            <FiAlertCircle className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-600" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-cabin-medium text-yellow-700">Pendientes</p>
              <p className="text-2xl lg:text-3xl font-cabin-bold text-yellow-600">{isLoading ? '...' : totalPendingOrder}</p>
              <p className="text-xs text-yellow-600 font-cabin-medium mt-1">
                Requieren atención
              </p>
            </div>
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-200 rounded-full flex items-center justify-center shadow-lg">
              <FiClock className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-cabin-medium text-gray-600">Total de Pedidos</p>
              <p className="text-xl lg:text-2xl font-cabin-bold text-gray-800">{isLoading ? '...' : totalOrders}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-cabin-medium text-gray-600">Entregados</p>
              <p className="text-xl lg:text-2xl font-cabin-bold text-green-600">{isLoading ? '...' : totalDeliveryOrders}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>



      {/* Gráficos */}
      {/* Gráficos */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-cabin-semibold text-gray-800 flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-amber-600" />
              Tendencia de Pedidos
            </h3>
          </div>
          <div className="h-64">
            <OrderChart data={orderTrendData} type="line" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-cabin-semibold text-gray-800 flex items-center">
              <FiPackage className="w-5 h-5 mr-2 text-amber-600" />
              Distribución por Estado
            </h3>
          </div>
          <div className="h-64">
            <OrderChart data={orderStatusData} type="doughnut" />
          </div>
        </div>
      </div>

      {/* Alert Banner para Pedidos Pendientes */}
      {!isLoading && totalPendingOrder > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-cabin-semibold text-yellow-800">
                  ¡Atención! Tienes {totalPendingOrder} pedido{totalPendingOrder !== 1 ? 's' : ''} pendiente{totalPendingOrder !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm sm:text-base text-yellow-700 font-cabin-regular">
                  Estos pedidos requieren tu atención inmediata para procesamiento
                </p>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-12 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm lg:text-base"
              />
              <button 
                onClick={() => loadOrders()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Actualizar"
              >
                <FiRefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="w-full sm:w-48">
              <CustomDropdown
                options={[
                  { value: 'todos', label: 'Todas las Fechas' },
                  { value: 'hoy', label: 'Hoy' },
                  { value: 'semana', label: 'Esta Semana' },
                  { value: 'mes', label: 'Este Mes' }
                ]}
                selectedValues={[selectedDateRange]}
                onChange={(values) => setSelectedDateRange(values[0])}
                placeholder="Filtrar por fecha"
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-48">
              <CustomDropdown
                options={[
                  { value: 'all', label: 'Todos los Estados' },
                  { value: 'pending', label: 'Pendientes' },
                  { value: 'sent', label: 'Enviados' }
                ]}
                selectedValues={[selectedStatus]}
                onChange={(values) => setSelectedStatus(values[0])}
                placeholder="Filtrar por estado"
                className="w-full"
              />
            </div>

            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-cabin-medium transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <FiFilter className="w-4 h-4" />
              <span className="text-sm sm:text-base">Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header de la tabla con contadores */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-cabin-semibold text-gray-800">
                Lista de Pedidos
              </h3>
              <span className="text-sm text-gray-600 font-cabin-regular">
                {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            </div>
            {filteredOrders.filter(o => getOrderStatus(o).status === 'pendiente').length > 0 && (
              <div className="flex items-center space-x-2">
                <FiAlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-cabin-medium text-yellow-700">
                  {filteredOrders.filter(o => getOrderStatus(o).status === 'pendiente').length} pendiente{filteredOrders.filter(o => getOrderStatus(o).status === 'pendiente').length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Folio
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Cliente
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Total
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Estado
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Fecha Creación
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Última Actualización
                </th>

              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-cabin-medium">Cargando órdenes...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <p className="text-red-600 font-cabin-medium">{error}</p>
                    <button 
                      onClick={refreshOrders}
                      className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-cabin-medium">No hay órdenes disponibles</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.order_id} 
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer group"
                    onClick={() => handleViewOrder(order)}
                  >
                    <td className="py-4 px-6">
                      <div className="font-cabin-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {order.folio}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-cabin-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {order.contact_information?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 font-cabin-regular group-hover:text-blue-500 transition-colors">
                          {order.contact_information?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-cabin-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        ${parseFloat(order.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        const orderStatus = getOrderStatus(order);
                        return (
                          <div className="flex items-center space-x-2">
                            <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                              {orderStatus.icon}
                            </div>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border transition-colors ${orderStatus.color}`}>
                              {orderStatus.label}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-cabin-regular text-gray-700 group-hover:text-blue-600 transition-colors">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-cabin-regular text-gray-700 group-hover:text-blue-600 transition-colors">
                        {formatDate(order.updated_at)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalOrders}
            itemsPerPage={limit}
            onPageChange={goToPage}
            onItemsPerPageChange={changeLimit}
            itemsPerPageOptions={[8, 16, 24, 32]}
          />
        </div>
      </div>


    </div>
  );
};

export default Pedidos; 