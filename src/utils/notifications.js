import toast from 'react-hot-toast';

// Notificaciones de éxito
export const showSuccess = (message) => {
  toast.success(message, {
    id: message, // Evita duplicados
  });
};

// Notificaciones de error
export const showError = (message) => {
  toast.error(message, {
    id: message, // Evita duplicados
  });
};

// Notificaciones de información
export const showInfo = (message) => {
  toast(message, {
    id: message,
    icon: 'ℹ️',
  });
};

// Notificaciones de carga
export const showLoading = (message) => {
  return toast.loading(message, {
    id: message,
  });
};

// Notificaciones específicas para stock
export const showStockUpdateSuccess = (productName, oldStock, newStock) => {
  const change = newStock - oldStock;
  const changeText = change > 0 ? `+${change}` : change;
  
  toast.success(
    `Stock actualizado: ${productName}\n${oldStock} → ${newStock} (${changeText})`,
    {
      id: `stock-update-${productName}`,
      duration: 4000,
    }
  );
};

export const showStockUpdateError = (productName, error) => {
  toast.error(
    `Error al actualizar stock de "${productName}": ${error}`,
    {
      id: `stock-error-${productName}`,
      duration: 5000,
    }
  );
};

// Notificaciones específicas para productos
export const showProductCreated = (productName) => {
  toast.success(`Producto "${productName}" creado exitosamente`, {
    id: `product-created-${productName}`,
  });
};

export const showProductUpdated = (productName) => {
  toast.success(`Producto "${productName}" actualizado exitosamente`, {
    id: `product-updated-${productName}`,
  });
};

export const showProductDeleted = (productName) => {
  toast.success(`Producto "${productName}" eliminado exitosamente`, {
    id: `product-deleted-${productName}`,
  });
};

// Notificaciones específicas para usuarios
export const showUserCreated = (userEmail) => {
  toast.success(`Usuario "${userEmail}" creado exitosamente`, {
    id: `user-created-${userEmail}`,
  });
};

export const showUserUpdated = (userEmail) => {
  toast.success(`Usuario "${userEmail}" actualizado exitosamente`, {
    id: `user-updated-${userEmail}`,
  });
};

// Notificaciones de autenticación
export const showLoginSuccess = (userEmail) => {
  toast.success(`Bienvenido, ${userEmail}`, {
    id: 'login-success',
  });
};

export const showLoginError = (error) => {
  toast.error(`Error de inicio de sesión: ${error}`, {
    id: 'login-error',
  });
};

export const showLogoutSuccess = () => {
  toast.success('Sesión cerrada exitosamente', {
    id: 'logout-success',
  });
};

// Notificaciones de carga de datos
export const showDataLoadError = (entity, error) => {
  toast.error(`Error al cargar ${entity}: ${error}`, {
    id: `data-load-error-${entity}`,
  });
};

export const showDataLoadSuccess = (entity, count) => {
  toast.success(`${count} ${entity} cargados exitosamente`, {
    id: `data-load-success-${entity}`,
  });
};

// Notificaciones específicas para órdenes
export const showOrderCreated = () => {
  toast.success('Orden creada exitosamente', {
    icon: '📦',
  });
};

export const showOrderUpdated = () => {
  toast.success('Orden actualizada exitosamente', {
    icon: '✅',
  });
};

export const showOrderDeleted = () => {
  toast.success('Orden eliminada exitosamente', {
    icon: '🗑️',
  });
};

export const showOrderStatusChanged = (status) => {
  toast.success(`Estado de la orden cambiado a: ${status}`, {
    icon: '🚚',
  });
};

export const showOrderStatusError = (error) => {
  toast.error(`Error al cambiar estado: ${error}`, {
    icon: '❌',
  });
};

// Notificaciones específicas para autores
export const showAuthorCreated = (authorName) => {
  toast.success(`Autor "${authorName}" creado exitosamente`, {
    icon: '✍️',
  });
};

export const showAuthorUpdated = (authorName) => {
  toast.success(`Autor "${authorName}" actualizado exitosamente`, {
    icon: '✅',
  });
};

export const showAuthorDeleted = (authorName) => {
  toast.success(`Autor "${authorName}" eliminado exitosamente`, {
    icon: '🗑️',
  });
};

// Notificaciones específicas para categorías
export const showCategoryCreated = (categoryName) => {
  toast.success(`Categoría "${categoryName}" creada exitosamente`, {
    icon: '📚',
  });
};

export const showCategoryUpdated = (categoryName) => {
  toast.success(`Categoría "${categoryName}" actualizada exitosamente`, {
    icon: '✅',
  });
};

export const showCategoryDeleted = (categoryName) => {
  toast.success(`Categoría "${categoryName}" eliminada exitosamente`, {
    icon: '🗑️',
  });
};

// Notificaciones específicas para temas
export const showTopicCreated = (topicName) => {
  toast.success(`Tema "${topicName}" creado exitosamente`, {
    icon: '📝',
  });
};

export const showTopicUpdated = (topicName) => {
  toast.success(`Tema "${topicName}" actualizado exitosamente`, {
    icon: '✅',
  });
};

export const showTopicDeleted = (topicName) => {
  toast.success(`Tema "${topicName}" eliminado exitosamente`, {
    icon: '🗑️',
  });
};
