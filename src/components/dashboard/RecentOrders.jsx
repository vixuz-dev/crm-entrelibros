import React from 'react';
import { FiEye, FiPackage, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const RecentOrders = () => {
  // Datos simulados de pedidos recientes
  const recentOrders = [
    {
      id: '#ORD-001',
      customer: 'María González',
      products: 3,
      total: 89.99,
      status: 'completed',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: '#ORD-002',
      customer: 'Carlos Rodríguez',
      products: 1,
      total: 24.99,
      status: 'pending',
      date: '2024-01-15',
      time: '13:45'
    },
    {
      id: '#ORD-003',
      customer: 'Ana Martínez',
      products: 2,
      total: 45.50,
      status: 'processing',
      date: '2024-01-15',
      time: '12:20'
    },
    {
      id: '#ORD-004',
      customer: 'Luis Pérez',
      products: 4,
      total: 120.75,
      status: 'completed',
      date: '2024-01-15',
      time: '11:15'
    },
    {
      id: '#ORD-005',
      customer: 'Sofia López',
      products: 1,
      total: 32.99,
      status: 'cancelled',
      date: '2024-01-15',
      time: '10:30'
    }
  ];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completado',
          icon: FiCheckCircle,
          color: 'text-green-600 bg-green-100',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          label: 'Pendiente',
          icon: FiClock,
          color: 'text-yellow-600 bg-yellow-100',
          borderColor: 'border-yellow-200'
        };
      case 'processing':
        return {
          label: 'Procesando',
          icon: FiPackage,
          color: 'text-blue-600 bg-blue-100',
          borderColor: 'border-blue-200'
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          icon: FiXCircle,
          color: 'text-red-600 bg-red-100',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: 'Desconocido',
          icon: FiClock,
          color: 'text-gray-600 bg-gray-100',
          borderColor: 'border-gray-200'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-cabin-semibold text-gray-800 mb-1">
            Pedidos Recientes
          </h3>
          <p className="text-sm font-cabin-regular text-gray-600">
            Últimos pedidos realizados en el sistema
          </p>
        </div>
        <button className="text-amber-600 hover:text-amber-700 font-cabin-medium text-sm transition-colors">
          Ver todos
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-cabin-semibold text-gray-700 text-sm">
                Pedido
              </th>
              <th className="text-left py-3 px-4 font-cabin-semibold text-gray-700 text-sm">
                Cliente
              </th>
              <th className="text-left py-3 px-4 font-cabin-semibold text-gray-700 text-sm">
                Productos
              </th>
              <th className="text-left py-3 px-4 font-cabin-semibold text-gray-700 text-sm">
                Total
              </th>
              <th className="text-left py-3 px-4 font-cabin-semibold text-gray-700 text-sm">
                Estado
              </th>
              <th className="text-left py-3 px-4 font-cabin-semibold text-gray-700 text-sm">
                Fecha
              </th>
              <th className="text-left py-3 px-4 font-cabin-semibold text-gray-700 text-sm">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-cabin-medium text-gray-800 text-sm">
                      {order.id}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-cabin-regular text-gray-700 text-sm">
                      {order.customer}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-cabin-regular text-gray-700 text-sm">
                      {order.products} {order.products === 1 ? 'producto' : 'productos'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-cabin-semibold text-gray-800 text-sm">
                      ${order.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-cabin-medium ${statusInfo.color} ${statusInfo.borderColor} border`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="font-cabin-regular text-gray-700">
                        {formatDate(order.date)}
                      </div>
                      <div className="font-cabin-regular text-gray-500 text-xs">
                        {order.time}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-gray-600 hover:text-amber-600 transition-colors p-1">
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders; 