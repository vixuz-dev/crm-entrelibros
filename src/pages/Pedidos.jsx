import React, { useState } from 'react';
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
  FiShoppingCart
} from 'react-icons/fi';
import OrderInformation from '../components/modals/OrderInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import OrderChart from '../components/charts/OrderChart';
import CustomDropdown from '../components/ui/CustomDropdown';

const Pedidos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedDateRange, setSelectedDateRange] = useState('todos');
  const [selectedUrgency, setSelectedUrgency] = useState('todos');

  // Datos simulados de pedidos
  const orders = [
    {
      id: 'ORD-001',
      customer: {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+52 55 1234 5678'
      },
      products: [
        { id: 1, title: 'El Principito', quantity: 2, price: 15.99 },
        { id: 2, title: 'Don Quijote', quantity: 1, price: 25.50 }
      ],
      total: 57.48,
      status: 'pendiente',
      orderDate: '2024-01-15',
      estimatedDelivery: '2024-01-20',
      actualDelivery: null,
      paymentMethod: 'Tarjeta de Crédito',
      shippingAddress: 'Av. Reforma 123, CDMX',
      trackingNumber: null,
      urgency: 'normal',
      notes: 'Entregar en horario de oficina'
    },
    {
      id: 'ORD-002',
      customer: {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+52 55 9876 5432'
      },
      products: [
        { id: 3, title: 'Cien años de soledad', quantity: 1, price: 18.99 },
        { id: 4, title: 'Harry Potter y la piedra filosofal', quantity: 3, price: 22.00 }
      ],
      total: 84.99,
      status: 'en_transito',
      orderDate: '2024-01-12',
      estimatedDelivery: '2024-01-18',
      actualDelivery: null,
      paymentMethod: 'PayPal',
      shippingAddress: 'Calle Juárez 456, Guadalajara',
      trackingNumber: 'TRK-123456789',
      urgency: 'urgente',
      notes: 'Cliente VIP'
    },
    {
      id: 'ORD-003',
      customer: {
        name: 'Ana Martínez',
        email: 'ana.martinez@email.com',
        phone: '+52 55 5555 1234'
      },
      products: [
        { id: 5, title: 'El Señor de los Anillos', quantity: 1, price: 35.00 }
      ],
      total: 35.00,
      status: 'entregado',
      orderDate: '2024-01-08',
      estimatedDelivery: '2024-01-15',
      actualDelivery: '2024-01-14',
      paymentMethod: 'Transferencia Bancaria',
      shippingAddress: 'Plaza Mayor 789, Monterrey',
      trackingNumber: 'TRK-987654321',
      urgency: 'normal',
      notes: 'Entregado antes de lo esperado'
    },
    {
      id: 'ORD-004',
      customer: {
        name: 'Luis Pérez',
        email: 'luis.perez@email.com',
        phone: '+52 55 1111 2222'
      },
      products: [
        { id: 6, title: '1984', quantity: 2, price: 16.50 },
        { id: 7, title: 'Orgullo y prejuicio', quantity: 1, price: 12.99 }
      ],
      total: 45.99,
      status: 'pendiente',
      orderDate: '2024-01-16',
      estimatedDelivery: '2024-01-22',
      actualDelivery: null,
      paymentMethod: 'Efectivo',
      shippingAddress: 'Paseo de la Reforma 321, CDMX',
      trackingNumber: null,
      urgency: 'critico',
      notes: 'Pedido para evento importante'
    },
    {
      id: 'ORD-005',
      customer: {
        name: 'Sofia López',
        email: 'sofia.lopez@email.com',
        phone: '+52 55 3333 4444'
      },
      products: [
        { id: 8, title: 'Los miserables', quantity: 1, price: 28.00 },
        { id: 9, title: 'Crimen y castigo', quantity: 1, price: 20.50 },
        { id: 10, title: 'El hobbit', quantity: 2, price: 18.75 }
      ],
      total: 86.00,
      status: 'en_transito',
      orderDate: '2024-01-10',
      estimatedDelivery: '2024-01-17',
      actualDelivery: null,
      paymentMethod: 'Tarjeta de Débito',
      shippingAddress: 'Av. Insurgentes 654, CDMX',
      trackingNumber: 'TRK-456789123',
      urgency: 'normal',
      notes: 'Paquete frágil'
    }
  ];

  // Datos para gráficos
  const orderStatusData = {
    labels: ['Pendientes', 'En Tránsito', 'Entregados', 'Cancelados'],
    datasets: [
      {
        data: [
          orders.filter(o => o.status === 'pendiente').length,
          orders.filter(o => o.status === 'en_transito').length,
          orders.filter(o => o.status === 'entregado').length,
          orders.filter(o => o.status === 'cancelado').length
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const orderTrendData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Pedidos Recibidos',
        data: [12, 19, 15, 25, 22, 18, 14],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Pedidos Entregados',
        data: [8, 15, 12, 20, 18, 16, 12],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

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

  // Funciones de manejo de modales
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      console.log('Pedido eliminado:', orderToDelete);
    }
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const cancelDeleteOrder = () => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('todos');
    setSelectedDateRange('todos');
    setSelectedUrgency('todos');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setModalMode('view');
  };

  const handleSaveOrder = (orderData) => {
    if (modalMode === 'edit') {
      console.log('Pedido actualizado:', orderData);
    }
  };

  // Filtrado de pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'todos' || order.status === selectedStatus;
    const matchesUrgency = selectedUrgency === 'todos' || order.urgency === selectedUrgency;
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Cálculo de métricas
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
  const inTransitOrders = orders.filter(o => o.status === 'en_transito').length;
  const deliveredOrders = orders.filter(o => o.status === 'entregado').length;
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageDeliveryTime = 5.2; // días promedio

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra todos los pedidos del sistema
          </p>
        </div>
        <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2">
          <FiPlus className="w-5 h-5" />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pedidos Pendientes - Destacado */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-lg p-6 relative overflow-hidden md:col-span-2 lg:col-span-1">
          {/* Highlight indicator */}
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-yellow-400"></div>
          <div className="absolute top-2 right-2">
            <FiAlertCircle className="w-4 h-4 text-yellow-600" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cabin-medium text-yellow-700">Pendientes</p>
              <p className="text-3xl font-cabin-bold text-yellow-600">{pendingOrders}</p>
              <p className="text-xs text-yellow-600 font-cabin-medium mt-1">
                Requieren atención
              </p>
            </div>
            <div className="w-14 h-14 bg-yellow-200 rounded-full flex items-center justify-center shadow-lg">
              <FiClock className="w-7 h-7 text-yellow-700" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cabin-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-cabin-bold text-gray-800">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>



        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cabin-medium text-gray-600">En Tránsito</p>
              <p className="text-2xl font-cabin-bold text-blue-600">{inTransitOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiTruck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cabin-medium text-gray-600">Entregados</p>
              <p className="text-2xl font-cabin-bold text-green-600">{deliveredOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>



      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
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
      {pendingOrders > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-cabin-semibold text-yellow-800">
                  ¡Atención! Tienes {pendingOrders} pedido{pendingOrders !== 1 ? 's' : ''} pendiente{pendingOrders !== 1 ? 's' : ''}
                </h3>
                <p className="text-yellow-700 font-cabin-regular">
                  Estos pedidos requieren tu atención inmediata para procesamiento
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStatus('pendiente')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-cabin-medium transition-colors flex items-center space-x-2"
            >
              <FiClock className="w-4 h-4" />
              <span>Ver Pendientes</span>
            </button>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-48">
              <CustomDropdown
                options={[
                  { value: 'todos', label: 'Todos los Estados' },
                  { value: 'pendiente', label: 'Pendientes' },
                  { value: 'en_transito', label: 'En Tránsito' },
                  { value: 'entregado', label: 'Entregados' },
                  { value: 'cancelado', label: 'Cancelados' }
                ]}
                selectedValues={[selectedStatus]}
                onChange={(values) => setSelectedStatus(values[0])}
                placeholder="Filtrar por estado"
                className="w-full"
              />
            </div>

            <div className="w-48">
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

            <div className="w-48">
              <CustomDropdown
                options={[
                  { value: 'todos', label: 'Todas las Urgencias' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'urgente', label: 'Urgente' },
                  { value: 'critico', label: 'Crítico' }
                ]}
                selectedValues={[selectedUrgency]}
                onChange={(values) => setSelectedUrgency(values[0])}
                placeholder="Filtrar por urgencia"
                className="w-full"
              />
            </div>

                        <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-cabin-medium transition-colors flex items-center space-x-2"
            >
              <FiFilter className="w-4 h-4" />
              <span>Limpiar</span>
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
            {filteredOrders.filter(o => o.status === 'pendiente').length > 0 && (
              <div className="flex items-center space-x-2">
                <FiAlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-cabin-medium text-yellow-700">
                  {filteredOrders.filter(o => o.status === 'pendiente').length} pendiente{filteredOrders.filter(o => o.status === 'pendiente').length !== 1 ? 's' : ''}
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
                  ID Pedido
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Cliente
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Productos
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Total
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Estado
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Fecha Pedido
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Entrega Estimada
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Urgencia
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    order.status === 'pendiente' ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="font-cabin-semibold text-gray-800">
                        {order.id}
                      </div>
                      {order.urgency === 'critico' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {order.urgency === 'urgente' && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-cabin-semibold text-gray-800">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-600 font-cabin-regular">
                        {order.customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-700">
                      {order.products.length} producto{order.products.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.products[0]?.title}
                      {order.products.length > 1 && ` +${order.products.length - 1} más`}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-semibold text-gray-800">
                      {formatPrice(order.total)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(order.status)}`}>
                        {order.status === 'pendiente' && 'Pendiente'}
                        {order.status === 'en_transito' && 'En Tránsito'}
                        {order.status === 'entregado' && 'Entregado'}
                        {order.status === 'cancelado' && 'Cancelado'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-regular text-gray-700">
                      {formatDate(order.orderDate)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-regular text-gray-700">
                      {formatDate(order.estimatedDelivery)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-cabin-medium ${getUrgencyColor(order.urgency)}`}>
                      {order.urgency === 'normal' && 'Normal'}
                      {order.urgency === 'urgente' && 'Urgente'}
                      {order.urgency === 'critico' && 'Crítico'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => window.location.href = `/pedidos/detalle/${order.id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      <OrderInformation 
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveOrder}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Pedido"
        description={`¿Estás seguro de que quieres eliminar el pedido "${orderToDelete?.id}"? Esta acción no se puede deshacer.`}
        onCancel={cancelDeleteOrder}
        onAccept={confirmDeleteOrder}
        cancelText="Cancelar"
        acceptText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default Pedidos; 