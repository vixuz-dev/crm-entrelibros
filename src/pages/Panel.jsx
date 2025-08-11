import React from 'react';
import { FiUsers, FiDollarSign, FiStar } from 'react-icons/fi';
import SalesChart from '../components/charts/SalesChart';
import QuickActions from '../components/dashboard/QuickActions';
import RecentOrders from '../components/dashboard/RecentOrders';

const Panel = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
          Panel de Control
        </h1>
        <p className="text-gray-600 font-cabin-regular">
          Vista general del sistema de gestión de libros infantiles
        </p>
      </div>
      
      {/* Cards de métricas principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card - Usuarios Activos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Usuarios Activos</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">1,247</p>
              <p className="text-sm font-cabin-regular text-gray-500">Hoy</p>
            </div>
          </div>
        </div>
        
        {/* Card - Total Ventas */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total Ventas</h3>
              <p className="text-2xl font-cabin-bold text-green-600">$45,892</p>
              <p className="text-sm font-cabin-regular text-gray-500">Hasta hoy</p>
            </div>
          </div>
        </div>
        
        {/* Card - Usuarios Suscritos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiStar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Usuarios Suscritos</h3>
              <p className="text-2xl font-cabin-bold text-purple-600">892</p>
              <p className="text-sm font-cabin-regular text-gray-500">Hoy</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions - Posición estratégica después de las métricas */}
      <QuickActions />
      
      {/* Gráfico de Ventas */}
      <SalesChart />
      
      {/* Tabla de Pedidos Recientes */}
      <RecentOrders />
    </div>
  );
};

export default Panel; 