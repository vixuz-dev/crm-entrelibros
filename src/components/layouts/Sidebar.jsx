import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
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
  FiX,
  FiTag,
  FiList,
  FiChevronDown,
  FiChevronRight,
  FiAward,
  FiPlus
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { logout as logoutService } from '../../api/auth';
import { ROUTES } from '../../utils/routes';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const mainMenuItems = [
    {
      id: 'panel',
      label: 'Panel',
      icon: FiGrid,
      route: ROUTES.PANEL,
      active: location.pathname === ROUTES.PANEL
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: FiUser,
      route: ROUTES.USERS,
      active: location.pathname.startsWith(ROUTES.USERS)
    },
    {
      id: 'libros',
      label: 'Libros',
      icon: FiBook,
      route: ROUTES.BOOKS,
      active: location.pathname.startsWith(ROUTES.BOOKS),
      submenu: [
        {
          id: 'listado',
          label: 'Listado',
          icon: FiList,
          route: ROUTES.BOOKS_LIST,
          active: location.pathname === ROUTES.BOOKS_LIST
        },
        {
          id: 'categorias',
          label: 'Categorías',
          icon: FiGridAlt,
          route: ROUTES.BOOKS_CATEGORIES,
          active: location.pathname === ROUTES.BOOKS_CATEGORIES
        },
        {
          id: 'temas',
          label: 'Temas',
          icon: FiTag,
          route: ROUTES.TOPICS,
          active: location.pathname === ROUTES.TOPICS
        },
        {
          id: 'autores',
          label: 'Autores',
          icon: FiUser,
          route: ROUTES.BOOKS_AUTHORS,
          active: location.pathname === ROUTES.BOOKS_AUTHORS
        }
      ]
    },
    {
      id: 'membresias',
      label: 'Membresías',
      icon: FiCreditCard,
      route: ROUTES.MEMBERSHIPS,
      active: location.pathname.startsWith(ROUTES.MEMBERSHIPS)
    },
    {
      id: 'book-club-lectores',
      label: 'Book Club Lectores',
      icon: FiAward,
      route: ROUTES.BOOK_CLUB_LECTORES,
      active: location.pathname.startsWith(ROUTES.BOOK_CLUB_LECTORES),
      submenu: [
        {
          id: 'crear-book-club',
          label: 'Crear book club',
          icon: FiPlus,
          route: ROUTES.BOOK_CLUB_LECTORES_CREATE,
          active: location.pathname === ROUTES.BOOK_CLUB_LECTORES_CREATE || location.pathname === ROUTES.BOOK_CLUB_LECTORES
        },
        {
          id: 'listado-book-club',
          label: 'Listado',
          icon: FiList,
          route: ROUTES.BOOK_CLUB_LECTORES_LIST,
          active: location.pathname === ROUTES.BOOK_CLUB_LECTORES_LIST
        }
      ]
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: FiShoppingCart,
      route: ROUTES.ORDERS,
      active: location.pathname.startsWith(ROUTES.ORDERS)
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: FiUsers,
      route: ROUTES.CUSTOMERS,
      active: location.pathname.startsWith(ROUTES.CUSTOMERS)
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: FiPackage,
      route: ROUTES.INVENTORY,
      active: location.pathname.startsWith(ROUTES.INVENTORY),
      disabled: true
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: FiBarChart2,
      route: ROUTES.REPORTS,
      active: location.pathname.startsWith(ROUTES.REPORTS),
      disabled: true
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: FiSettings,
      route: ROUTES.SETTINGS,
      active: location.pathname.startsWith(ROUTES.SETTINGS),
      disabled: true
    },
    {
      id: 'ayuda',
      label: 'Ayuda',
      icon: FiHelpCircle,
      route: ROUTES.HELP,
      active: location.pathname.startsWith(ROUTES.HELP),
      disabled: true
    }
  ];

  const accountMenuItems = [
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: FiBell,
      route: ROUTES.NOTIFICATIONS,
      badge: 24,
      badgeColor: 'bg-green-500',
      disabled: true
    },
    {
      id: 'logout',
      label: 'Cerrar Sesión',
      icon: FiLogOut,
      route: ROUTES.LOGIN,
      badge: null
    }
  ];

  const handleNavigation = async (route, disabled = false) => {
    // No permitir navegación si está deshabilitado
    if (disabled) {
      return;
    }
    
    // Manejar logout
    if (route === ROUTES.LOGIN) {
      try {
    
        
        // Usar el servicio de logout que limpia catálogos y token
        await logoutService();
        
        // Limpiar información del administrador
        logout();
        
        
        
        // Redirigir al login
        navigate(ROUTES.LOGIN);
      } catch (error) {
        console.error('Error during logout:', error);
        
        // Aún limpiar datos locales y redirigir al login
        logout();
        navigate(ROUTES.LOGIN);
      }
      return;
    }
    
    navigate(route);
    // Cerrar sidebar en móvil después de navegar
    if (onClose) {
      onClose();
    }
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isSubmenuExpanded = (menuId) => {
    return expandedMenus[menuId] || false;
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex justify-center flex-1">
            <img 
              src="/entrelibros_logo.webp" 
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
      <nav className="flex-1 p-4 overflow-y-auto sidebar-nav">
        <div className="space-y-2">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = isSubmenuExpanded(item.id);
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.disabled) {
                      return;
                    }
                    if (hasSubmenu) {
                      toggleSubmenu(item.id);
                    } else {
                      handleNavigation(item.route, item.disabled);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed opacity-50'
                      : item.active
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-cabin-medium text-sm">{item.label}</span>
                  </div>
                  {hasSubmenu && (
                    <div className="flex items-center">
                      {isExpanded ? (
                        <FiChevronDown className="w-4 h-4" />
                      ) : (
                        <FiChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </button>
                
                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleNavigation(subItem.route)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                            subItem.active
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span className="font-cabin-medium text-sm">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Account Section */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
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
                onClick={() => handleNavigation(item.route, item.disabled)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
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