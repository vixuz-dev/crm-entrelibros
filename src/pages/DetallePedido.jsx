import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiUser, 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiBook,
  FiPhone,
  FiMail,
  FiShoppingCart,
  FiGift,
  FiTruck as FiDeliveryTruck,
  FiPrinter,
  FiLoader
} from 'react-icons/fi';

const DetallePedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = id;
  const [order, setOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Datos simulados de pedidos (mismo que en Pedidos.jsx)
  const orders = [
    {
      id: 'ORD-001',
      customer: {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+52 55 1234 5678'
      },
      products: [
        { 
          id: 1, 
          title: 'El Principito', 
          quantity: 2, 
          price: 15.99,
          image: 'https://pagedone.io/asset/uploads/1718189222.png',
          size: 'Tapa Blanda',
          color: 'Azul'
        },
        { 
          id: 2, 
          title: 'Don Quijote', 
          quantity: 1, 
          price: 25.50,
          image: 'https://pagedone.io/asset/uploads/1718189265.png',
          size: 'Tapa Dura',
          color: 'Verde'
        }
      ],
      total: 57.48,
      subtotal: 52.48,
      shipping: 5.00,
      tax: 0.00,
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
        { 
          id: 3, 
          title: 'Cien años de soledad', 
          quantity: 1, 
          price: 18.99,
          image: 'https://pagedone.io/asset/uploads/1718189276.png',
          size: 'Tapa Blanda',
          color: 'Negro'
        },
        { 
          id: 4, 
          title: 'Harry Potter y la piedra filosofal', 
          quantity: 3, 
          price: 22.00,
          image: 'https://pagedone.io/asset/uploads/1718189288.png',
          size: 'Tapa Dura',
          color: 'Rojo'
        }
      ],
      total: 84.99,
      subtotal: 79.99,
      shipping: 5.00,
      tax: 0.00,
      status: 'en_curso',
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
        { 
          id: 5, 
          title: 'El Señor de los Anillos', 
          quantity: 1, 
          price: 35.00,
          image: 'https://pagedone.io/asset/uploads/1718189222.png',
          size: 'Tapa Dura',
          color: 'Dorado'
        }
      ],
      total: 35.00,
      subtotal: 30.00,
      shipping: 5.00,
      tax: 0.00,
      status: 'enviado',
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
        phone: '+52 55 7777 8888'
      },
      products: [
        { 
          id: 6, 
          title: 'El Hobbit', 
          quantity: 1, 
          price: 28.00,
          image: 'https://pagedone.io/asset/uploads/1718189276.png',
          size: 'Tapa Dura',
          color: 'Verde'
        }
      ],
      total: 33.00,
      subtotal: 28.00,
      shipping: 5.00,
      tax: 0.00,
      status: 'entregado',
      orderDate: '2024-01-05',
      estimatedDelivery: '2024-01-12',
      actualDelivery: '2024-01-10',
      paymentMethod: 'Efectivo',
      shippingAddress: 'Calle Morelos 321, Puebla',
      trackingNumber: 'TRK-555666777',
      urgency: 'normal',
      notes: 'Cliente satisfecho con la entrega'
    }
  ];

  useEffect(() => {
    if (orderId) {
      const foundOrder = orders.find(o => o.id === orderId);
      setOrder(foundOrder);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-cabin-semibold text-gray-600">Pedido no encontrado</h2>
          <p className="text-gray-500 mt-2">El pedido con ID {orderId} no existe</p>
          <button
            onClick={() => navigate('/pedidos')}
            className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Volver a Pedidos
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en_curso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enviado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
        return <FiClock className="w-5 h-5" />;
      case 'en_curso':
        return <FiPackage className="w-5 h-5" />;
      case 'enviado':
        return <FiTruck className="w-5 h-5" />;
      case 'entregado':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'cancelado':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiPackage className="w-5 h-5" />;
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const updateOrderStatus = (newStatus) => {
    setIsUpdating(true);
    setUpdateMessage('');
    
    // Simular actualización en la base de datos
    setTimeout(() => {
      setOrder(prevOrder => ({
        ...prevOrder,
        status: newStatus,
        // Actualizar fechas según el estado
        ...(newStatus === 'enviado' && { 
          estimatedDelivery: new Date().toISOString().split('T')[0] 
        }),
        ...(newStatus === 'entregado' && { 
          actualDelivery: new Date().toISOString().split('T')[0] 
        })
      }));
      setIsUpdating(false);
      setUpdateMessage(`Estado actualizado a: ${newStatus === 'en_curso' ? 'En Curso' : newStatus === 'enviado' ? 'Enviado' : 'Entregado'}`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setUpdateMessage(''), 3000);
    }, 1000);
  };

  // Timeline steps
  const timelineSteps = [
    {
      id: 'pendiente',
      title: 'Pedido Realizado',
      description: 'Tu pedido ha sido recibido y está siendo procesado',
      date: formatDate(order.orderDate),
      completed: true,
      canUpdate: false
    },
    {
      id: 'en_curso',
      title: 'Pedido en Curso',
      description: 'Tu pedido está siendo preparado para el envío',
      date: formatDate(order.orderDate),
      completed: order.status === 'en_curso' || order.status === 'enviado' || order.status === 'entregado',
      canUpdate: order.status === 'pendiente',
      nextStatus: 'en_curso'
    },
    {
      id: 'enviado',
      title: 'Pedido Enviado',
      description: 'Tu pedido está en camino hacia tu dirección',
      date: formatDate(order.estimatedDelivery),
      completed: order.status === 'enviado' || order.status === 'entregado',
      canUpdate: order.status === 'en_curso',
      nextStatus: 'enviado'
    },
    {
      id: 'entregado',
      title: 'Pedido Entregado',
      description: 'Tu pedido ha sido entregado exitosamente',
      date: formatDate(order.actualDelivery || order.estimatedDelivery),
      completed: order.status === 'entregado',
      canUpdate: order.status === 'enviado',
      nextStatus: 'entregado'
    }
  ];

  return (
    <section className="py-24 relative bg-gray-100">
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full flex-col justify-start items-start gap-12 inline-flex">
          
          {/* Header con ID del pedido y botón de imprimir */}
          <div className="w-full justify-between items-center flex sm:flex-row flex-col gap-3">
            <div className="w-full flex-col justify-center sm:items-start items-center gap-1 inline-flex">
              <h2 className="text-gray-500 text-2xl font-semibold font-cabin leading-9">
                Pedido <span className="text-amber-600">#{order.id}</span>
              </h2>
              <span className="text-gray-500 text-base font-medium leading-relaxed">
                {formatDate(order.orderDate)}
              </span>
            </div>
            <button className="sm:w-fit w-full px-3.5 py-2 bg-amber-600 hover:bg-amber-800 transition-all duration-700 ease-in-out rounded-lg shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] justify-center items-center flex">
              <FiPrinter className="w-4 h-4 text-white" />
              <span className="px-1.5 text-white text-sm font-medium leading-6 whitespace-nowrap">
                Imprimir Factura
              </span>
            </button>
          </div>

          <div className="w-full justify-end items-start gap-8 inline-flex">
            <div className="w-full flex-col justify-start items-start gap-8 inline-flex">
              
              {/* Order Tracking */}
              <div className="w-full p-8 bg-white rounded-xl flex-col justify-start items-start gap-5 flex">
                <div className="w-full flex justify-between items-center pb-5 border-b border-gray-200">
                  <h2 className="text-gray-900 text-2xl font-semibold font-cabin leading-9">
                    Estado del Pedido
                  </h2>
                  {isUpdating && (
                    <div className="flex items-center space-x-2 text-amber-600">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Actualizando estado...</span>
                    </div>
                  )}
                </div>
                
                {/* Notificación de actualización */}
                {updateMessage && (
                  <div className="w-full p-3 bg-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 text-sm font-medium">{updateMessage}</span>
                    </div>
                  </div>
                )}
                                 <div className="w-full flex-col justify-center items-center">
                   <ol className="flex md:flex-row flex-col md:items-start items-center justify-between w-full md:gap-1 gap-4">
                     {timelineSteps.map((step, index) => (
                       <li key={step.id} className={`group flex relative justify-start ${
                         index < timelineSteps.length - 1 ? 'after:content-[\'\'] lg:after:w-11 md:after:w-5 after:w-5 after:h-0.5 md:after:border after:border-dashed md:after:bg-gray-500 after:inline-block after:absolute md:after:top-7 after:top-3 xl:after:left-44 lg:after:left-40 md:after:left-36' : ''
                       }`}>
                         <div className="w-full mr-1 block z-10 flex flex-col items-center justify-start gap-1">
                           <div className="justify-center items-center gap-1.5 inline-flex">
                             <h5 className={`text-center text-lg font-medium leading-normal ${
                               step.completed ? 'text-gray-900' : 'text-gray-500'
                             }`}>
                               {step.title}
                             </h5>
                             {step.completed && (
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                 <path d="M9.10815 11.2157C9.10815 11.2157 9.11044 11.2147 9.11433 11.2141C9.10997 11.2157 9.10815 11.2157 9.10815 11.2157Z" fill="#047857" />
                                 <path d="M9.13686 11.2157C9.13686 11.2157 9.13456 11.2147 9.13068 11.2141C9.13331 11.2151 9.136 11.2157 9.136 11.2157L9.13686 11.2157Z" fill="#047857" />
                                 <path fillRule="evenodd" clipRule="evenodd" d="M1.83337 9.99992C1.83337 5.48959 5.48972 1.83325 10 1.83325C14.5104 1.83325 18.1667 5.48959 18.1667 9.99992C18.1667 14.5102 14.5104 18.1666 10 18.1666C5.48972 18.1666 1.83337 14.5102 1.83337 9.99992ZM14.3635 7.92721C14.6239 7.66687 14.6239 7.24476 14.3635 6.98441C14.1032 6.72406 13.6811 6.72406 13.4207 6.98441L9.82961 10.5755C9.53851 10.8666 9.3666 11.0365 9.22848 11.1419C9.17307 11.1842 9.13961 11.2029 9.1225 11.2107C9.1054 11.2029 9.07194 11.1842 9.01653 11.1419C8.87841 11.0365 8.7065 10.8666 8.4154 10.5755L7.13815 9.29825C6.8778 9.03791 6.45569 9.03791 6.19534 9.29825C5.93499 9.55861 5.93499 9.98071 6.19534 10.2411L7.50018 11.5459C7.75408 11.7999 7.98968 12.0355 8.20775 12.2019C8.44909 12.3861 8.74554 12.5469 9.1225 12.5469C9.49946 12.5469 9.79592 12.3861 10.0373 12.2019C10.2553 12.0355 10.4909 11.7999 10.7448 11.5459L14.3635 7.92721Z" fill="#047857" />
                               </svg>
                             )}
                           </div>
                           <h6 className="text-center text-gray-500 text-base font-normal leading-relaxed">
                             {step.date}
                           </h6>
                           
                           {/* Botón de actualización de estado */}
                           {step.canUpdate && (
                             <button
                               onClick={() => updateOrderStatus(step.nextStatus)}
                               disabled={isUpdating}
                               className={`mt-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                                 isUpdating 
                                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                   : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                               }`}
                             >
                               {isUpdating ? 'Actualizando...' : 'Marcar como ' + step.title}
                             </button>
                           )}
                           
                           {/* Indicador de estado actual */}
                           {order.status === step.nextStatus && !step.completed && (
                             <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                               Estado Actual
                             </div>
                           )}
                         </div>
                       </li>
                     ))}
                   </ol>
                 </div>
              </div>

              {/* Order Items */}
              <div className="w-full p-8 bg-white rounded-xl flex-col justify-start items-start gap-5 flex">
                <h2 className="w-full text-gray-900 text-2xl font-semibold font-cabin leading-9 pb-5 border-b border-gray-200">
                  Productos del Pedido
                </h2>
                <div className="w-full flex-col justify-start items-start gap-5 flex pb-5 border-b border-gray-200">
                  {order.products.map((product, index) => (
                    <div key={index} className="w-full justify-start items-center lg:gap-8 gap-4 grid md:grid-cols-12 grid-cols-1">
                      <div className="md:col-span-8 col-span-12 w-full justify-start items-center lg:gap-5 gap-4 flex md:flex-row flex-col">
                        <img 
                          className="rounded-md object-cover w-20 h-20" 
                          src={product.image} 
                          alt={`${product.title} image`} 
                        />
                        <div className="w-full flex-col justify-start md:items-start items-center gap-3 inline-flex">
                          <h4 className="text-gray-900 text-xl font-medium leading-8">{product.title}</h4>
                          <div className="flex-col justify-start md:items-start items-center gap-0.5 flex">
                            <h6 className="text-gray-500 text-base font-normal leading-relaxed whitespace-nowrap">
                              Formato: {product.size}
                            </h6>
                            <h6 className="text-gray-500 text-base font-normal leading-relaxed">
                              Color: {product.color}
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-4 col-span-12 justify-between items-center gap-4 flex md:flex-row flex-col">
                        <h4 className="text-gray-500 text-xl font-semibold leading-8">
                          {formatPrice(product.price)} x {product.quantity}
                        </h4>
                        <h4 className="text-gray-900 text-xl font-semibold leading-8">
                          {formatPrice(product.price * product.quantity)}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full flex-col justify-start items-start gap-5 flex">
                  <div className="w-full pb-1.5 flex-col justify-start items-start gap-4 flex">
                    <div className="w-full justify-between items-start gap-6 inline-flex">
                      <h6 className="text-gray-500 text-base font-normal leading-relaxed">Subtotal</h6>
                      <h6 className="text-right text-gray-500 text-base font-medium leading-relaxed">
                        {formatPrice(order.subtotal)}
                      </h6>
                    </div>
                    <div className="w-full justify-between items-start gap-6 inline-flex">
                      <h6 className="text-gray-500 text-base font-normal leading-relaxed">Envío</h6>
                      <h6 className="text-right text-gray-500 text-base font-medium leading-relaxed">
                        {formatPrice(order.shipping)}
                      </h6>
                    </div>
                    <div className="w-full justify-between items-start gap-6 inline-flex">
                      <h6 className="text-gray-500 text-base font-normal leading-relaxed">Impuestos</h6>
                      <h6 className="text-right text-gray-500 text-base font-medium leading-relaxed">
                        {formatPrice(order.tax)}
                      </h6>
                    </div>
                  </div>
                  <div className="w-full justify-between items-start gap-6 inline-flex">
                    <h5 className="text-gray-900 text-lg font-semibold leading-relaxed">Total</h5>
                    <h5 className="text-right text-gray-900 text-lg font-semibold leading-relaxed">
                      {formatPrice(order.total)}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="w-full p-8 bg-white rounded-xl flex-col justify-start items-start gap-5 flex">
                <h2 className="w-full text-gray-900 text-2xl font-semibold font-cabin leading-9 pb-5 border-b border-gray-200">
                  Información del Cliente
                </h2>
                <div className="w-full grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Nombre</label>
                    <p className="font-cabin-semibold text-gray-800 text-lg">{order.customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Email</label>
                    <p className="font-cabin-semibold text-gray-800 text-lg">{order.customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Teléfono</label>
                    <p className="font-cabin-semibold text-gray-800 text-lg">{order.customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Información de Envío */}
              <div className="w-full p-8 bg-white rounded-xl flex-col justify-start items-start gap-5 flex">
                <h2 className="w-full text-gray-900 text-2xl font-semibold font-cabin leading-9 pb-5 border-b border-gray-200">
                  Información de Envío
                </h2>
                <div className="w-full grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Dirección</label>
                    <p className="font-cabin-semibold text-gray-800 text-lg">{order.shippingAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Número de Seguimiento</label>
                    <p className="font-cabin-semibold text-gray-800 text-lg">
                      {order.trackingNumber || 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Método de Pago</label>
                    <p className="font-cabin-semibold text-gray-800 text-lg">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-cabin-medium text-gray-600">Estado</label>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-cabin-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                                                 <span className="ml-2">
                           {order.status === 'pendiente' && 'Pendiente'}
                           {order.status === 'en_curso' && 'En Curso'}
                           {order.status === 'enviado' && 'Enviado'}
                           {order.status === 'entregado' && 'Entregado'}
                           {order.status === 'cancelado' && 'Cancelado'}
                         </span>
                      </span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-cabin-medium ${getUrgencyColor(order.urgency)}`}>
                        {order.urgency === 'normal' && 'Normal'}
                        {order.urgency === 'urgente' && 'Urgente'}
                        {order.urgency === 'critico' && 'Crítico'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas del Pedido */}
              <div className="w-full flex-col justify-start items-start gap-1.5 flex">
                <h6 className="text-right text-gray-900 text-base font-medium leading-relaxed">Notas del Pedido:</h6>
                <p className="text-gray-500 text-sm font-normal leading-normal">
                  {order.notes || 'Sin notas adicionales'}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetallePedido; 