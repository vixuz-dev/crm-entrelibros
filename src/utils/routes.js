// Rutas del CRM EntreLibros
// Todas las rutas están en español para mejor UX

export const ROUTES = {
  // Rutas de autenticación
  LOGIN: "/iniciar-sesion",
  REGISTER: "/registrarse",
  FORGOT_PASSWORD: "/recuperar-contrasena",
  RESET_PASSWORD: "/restablecer-contrasena",
  
  // Rutas principales del dashboard
  PANEL: "/panel",
  
  // Rutas de gestión de usuarios
  USERS: "/usuarios",
  USERS_CREATE: "/usuarios/crear",
  USERS_EDIT: "/usuarios/editar/:id",
  USERS_VIEW: "/usuarios/ver/:id",
  USERS_PROFILE: "/usuarios/perfil",
  
  // Rutas de gestión de libros
  BOOKS: "/libros",
  BOOKS_CREATE: "/libros/crear",
  BOOKS_EDIT: "/libros/editar/:id",
  BOOKS_VIEW: "/libros/ver/:id",
  BOOKS_LIST: "/libros/listado",
  BOOKS_CATEGORIES: "/libros/categorias",
  BOOKS_AUTHORS: "/libros/autores",
  BOOKS_PUBLISHERS: "/libros/editoriales",
  
  // Rutas de categorías
  CATEGORIES: "/categorias",
  CATEGORIES_CREATE: "/categorias/crear",
  CATEGORIES_EDIT: "/categorias/editar/:id",
  CATEGORIES_VIEW: "/categorias/ver/:id",
  
  // Rutas de temas
  TOPICS: "/temas",
  TOPICS_CREATE: "/temas/crear",
  TOPICS_EDIT: "/temas/editar/:id",
  TOPICS_VIEW: "/temas/ver/:id",
  
  // Rutas de membresías
  MEMBERSHIPS: "/membresias",
  MEMBERSHIPS_CREATE: "/membresias/crear",
  MEMBERSHIPS_EDIT: "/membresias/editar/:id",
  MEMBERSHIPS_VIEW: "/membresias/ver/:id",
  MEMBERSHIPS_DETAIL: "/membresias/detalle/:id",
  MEMBERSHIPS_PLANS: "/membresias/planes",
  
  // Rutas de Book Club Lectores
  BOOK_CLUB_LECTORES: "/book-club-lectores",
  BOOK_CLUB_LECTORES_CREATE: "/book-club-lectores/crear",
  BOOK_CLUB_LECTORES_LIST: "/book-club-lectores/listado",
  
  // Rutas de ventas y pedidos
  ORDERS: "/pedidos",
  ORDERS_CREATE: "/pedidos/crear",
  ORDERS_EDIT: "/pedidos/editar/:id",
  ORDERS_VIEW: "/pedidos/ver/:id",
  ORDERS_HISTORY: "/pedidos/historial",
  ORDERS_INFORMATION: "/pedidos/informacion",
  
  // Rutas de clientes
  CUSTOMERS: "/clientes",
  CUSTOMERS_CREATE: "/clientes/crear",
  CUSTOMERS_EDIT: "/clientes/editar/:id",
  CUSTOMERS_VIEW: "/clientes/ver/:id",
  CUSTOMERS_PROFILE: "/clientes/perfil/:id",
  
  // Rutas de inventario
  INVENTORY: "/inventario",
  INVENTORY_STOCK: "/inventario/stock",
  INVENTORY_MOVEMENTS: "/inventario/movimientos",
  INVENTORY_ALERTS: "/inventario/alertas",
  
  // Rutas de reportes
  REPORTS: "/reportes",
  REPORTS_SALES: "/reportes/ventas",
  REPORTS_BOOKS: "/reportes/libros",
  REPORTS_CUSTOMERS: "/reportes/clientes",
  REPORTS_MEMBERSHIPS: "/reportes/membresias",
  REPORTS_INVENTORY: "/reportes/inventario",
  
  // Rutas de configuración
  SETTINGS: "/configuracion",
  SETTINGS_GENERAL: "/configuracion/general",
  SETTINGS_USERS: "/configuracion/usuarios",
  SETTINGS_PERMISSIONS: "/configuracion/permisos",
  SETTINGS_EMAIL: "/configuracion/email",
  SETTINGS_PAYMENT: "/configuracion/pagos",
  
  // Rutas de notificaciones
  NOTIFICATIONS: "/notificaciones",
  NOTIFICATIONS_SETTINGS: "/notificaciones/configuracion",
  
  // Rutas de ayuda y soporte
  HELP: "/ayuda",
  HELP_FAQ: "/ayuda/preguntas-frecuentes",
  HELP_CONTACT: "/ayuda/contacto",
  HELP_DOCUMENTATION: "/ayuda/documentacion",
  
  // Rutas de error
  ERROR_404: "/404",
  ERROR_500: "/500",
  ERROR_UNAUTHORIZED: "/no-autorizado",
  ERROR_FORBIDDEN: "/acceso-denegado",
};

// Función helper para generar rutas con parámetros
export const generateRoute = (route, params = {}) => {
  let generatedRoute = route;
  
  Object.keys(params).forEach(key => {
    generatedRoute = generatedRoute.replace(`:${key}`, params[key]);
  });
  
  return generatedRoute;
};

// Función helper para verificar si una ruta está activa
export const isActiveRoute = (currentPath, route) => {
  return currentPath === route || currentPath.startsWith(route + '/');
};

// Función helper para obtener el título de la página basado en la ruta
export const getPageTitle = (pathname) => {
  const routeTitles = {
    [ROUTES.DASHBOARD]: "Dashboard",
    [ROUTES.PANEL]: "Panel",
    [ROUTES.USERS]: "Usuarios",
    [ROUTES.BOOKS]: "Libros",
    [ROUTES.BOOKS_LIST]: "Listado de Libros",
    [ROUTES.BOOKS_CATEGORIES]: "Categorías",
    [ROUTES.BOOKS_AUTHORS]: "Autores",
    [ROUTES.CATEGORIES]: "Categorías",
    [ROUTES.TOPICS]: "Temas",
    [ROUTES.MEMBERSHIPS]: "Membresías",
    [ROUTES.BOOK_CLUB_LECTORES]: "Book Club Lectores",
    [ROUTES.BOOK_CLUB_LECTORES_CREATE]: "Crear Book Club",
    [ROUTES.BOOK_CLUB_LECTORES_LIST]: "Listado de Book Clubs",
    [ROUTES.ORDERS]: "Pedidos",
    [ROUTES.CUSTOMERS]: "Clientes",
    [ROUTES.INVENTORY]: "Inventario",
    [ROUTES.REPORTS]: "Reportes",
    [ROUTES.SETTINGS]: "Configuración",
    [ROUTES.NOTIFICATIONS]: "Notificaciones",
    [ROUTES.HELP]: "Ayuda",
  };
  
  return routeTitles[pathname] || "EntreLibros CRM";
}; 