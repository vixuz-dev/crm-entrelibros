import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiGrid,
  FiUsers, 
  FiBook, 
  FiGrid as FiGridAlt, 
  FiCreditCard,
  FiBell,
  FiLogOut,
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = [
    {
      id: 'panel',
      label: 'Panel',
      icon: FiGrid,
      route: '/panel',
      active: location.pathname === '/panel'
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: FiUser,
      route: '/usuarios',
      active: location.pathname.startsWith('/usuarios')
    },
    {
      id: 'libros',
      label: 'Libros',
      icon: FiBook,
      route: '/libros',
      active: location.pathname.startsWith('/libros')
    },
    {
      id: 'categorias',
      label: 'Categorías',
      icon: FiGridAlt,
      route: '/categorias',
      active: location.pathname.startsWith('/categorias')
    },
    {
      id: 'membresias',
      label: 'Membresías',
      icon: FiCreditCard,
      route: '/membresias',
      active: location.pathname.startsWith('/membresias')
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: FiShoppingCart,
      route: '/pedidos',
      active: location.pathname.startsWith('/pedidos')
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: FiUsers,
      route: '/clientes',
      active: location.pathname.startsWith('/clientes')
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: FiPackage,
      route: '/inventario',
      active: location.pathname.startsWith('/inventario')
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: FiBarChart2,
      route: '/reportes',
      active: location.pathname.startsWith('/reportes')
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: FiSettings,
      route: '/configuracion',
      active: location.pathname.startsWith('/configuracion')
    },
    {
      id: 'ayuda',
      label: 'Ayuda',
      icon: FiHelpCircle,
      route: '/ayuda',
      active: location.pathname.startsWith('/ayuda')
    }
  ];

  const accountMenuItems = [
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: FiBell,
      route: '/notificaciones',
      badge: 24,
      badgeColor: 'bg-green-500'
    },
    {
      id: 'logout',
      label: 'Cerrar Sesión',
      icon: FiLogOut,
      route: '/iniciar-sesion',
      badge: null
    }
  ];

  const handleNavigation = (route) => {
    navigate(route);
    // Cerrar sidebar en móvil después de navegar
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex justify-center flex-1">
            <img 
              src="/src/assets/images/entrelibros_logo.webp" 
              alt="EntreLibros Logo" 
              className="h-12 w-auto"
            />
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.route)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                  item.active
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-cabin-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Account Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <h3 className="text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
            Sesión
          </h3>
        </div>
        <div className="space-y-2">
          {accountMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.route)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-cabin-medium text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`${item.badgeColor} text-white text-xs font-cabin-medium px-2 py-1 rounded-full min-w-[20px] text-center`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 