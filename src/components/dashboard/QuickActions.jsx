import React from 'react';
import { FiPlus, FiShoppingCart, FiBook, FiUser, FiPackage, FiCreditCard } from 'react-icons/fi';

const QuickActions = () => {
  const actions = [
    {
      id: 'new-customer',
      label: 'Nuevo Cliente',
      icon: FiUser,
      color: 'bg-blue-300 hover:bg-blue-400',
      description: 'Registrar nuevo cliente'
    },
    {
      id: 'add-product',
      label: 'Agregar Libro',
      icon: FiBook,
      color: 'bg-green-300 hover:bg-green-400',
      description: 'Añadir nuevo libro al catálogo'
    },
    {
      id: 'manage-inventory',
      label: 'Inventario',
      icon: FiPackage,
      color: 'bg-amber-300 hover:bg-amber-400',
      description: 'Gestionar inventario y stock'
    },
    {
      id: 'memberships',
      label: 'Membresías',
      icon: FiCreditCard,
      color: 'bg-purple-300 hover:bg-purple-400',
      description: 'Administrar membresías'
    }
  ];

  const handleAction = (actionId) => {
    // Aquí se manejarían las acciones específicas
    console.log(`Acción ejecutada: ${actionId}`);
    // En el futuro, aquí irían las navegaciones o modales
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-cabin-semibold text-gray-800 mb-1">
          Acciones Rápidas
        </h3>
        <p className="text-sm font-cabin-regular text-gray-600">
          Accede rápidamente a las funciones más utilizadas
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className={`${action.color} text-white rounded-lg p-4 transition-all duration-200 transform hover:scale-105 hover:shadow-lg group`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Icon className="w-6 h-6" />
                <span className="text-sm font-cabin-medium text-center">
                  {action.label}
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-8 transform -translate-x-1/2 left-1/2 pointer-events-none">
                {action.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions; 