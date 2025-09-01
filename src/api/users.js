import axios from '../utils/axiosConfig';
import { showError, showDataLoadError, showDataLoadSuccess } from '../utils/notifications';
import { prepareSearchTerm } from '../utils/searchUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get all users (administrators, clients, etc.)
 * @param {number} page - Page number (optional, default: 1)
 * @param {number} limit - Items per page (optional, default: 8)
 * @param {string} user_name - User name to search (optional)
 * @returns {Promise} Promise with users data
 */
export const getUsers = async (page = 1, limit = 8, user_name = '') => {
  try {
    console.log('API getUsers llamado con:', { page, limit, user_name });
    
    const requestBody = {
      page: page,
      limit: limit
    };

    // Construir la URL con query parameters
    let url = `${API_BASE_URL}/users/get-users`;
    const queryParams = new URLSearchParams();
    
    // Agregar user_name como query parameter si se proporciona
    if (user_name && user_name.trim()) {
      const preparedUserName = prepareSearchTerm(user_name);
      queryParams.append('user_name', preparedUserName);
    }
    
    // Agregar query parameters a la URL si existen
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await axios.post(url, requestBody);
    
    // Verificar si es un resultado válido (éxito o búsqueda sin resultados)
    if (response.data.status === true || response.data.status === 'true' || response.data.status_Message === "No se encontraron usuarios") {
      const userCount = response.data.users?.length || 0;
      // if (userCount > 0) {
      //   showDataLoadSuccess('usuarios', userCount);
      // } else {
      //   console.log('No se encontraron usuarios');
      // }
      
      return response.data;
    } else {
      showError(response.data.status_Message || 'Error al cargar usuarios');
      throw new Error(response.data.status_Message || 'Error al cargar usuarios');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar usuarios';
    showDataLoadError('usuarios', errorMessage);
    throw error;
  }
};

/**
 * Get all clients/users
 * @param {number} page - Page number (optional, default: 1)
 * @param {number} limit - Items per page (optional, default: 8)
 * @param {string} user_name - User name to search (optional)
 * @returns {Promise} Promise with users data
 */
export const getClients = async (page = 1, limit = 8, user_name = '') => {
  try {
    const requestBody = {
      page: page,
      limit: limit
    };

    // Construir la URL con query parameters
    let url = `${API_BASE_URL}/users/get-clients`;
    const queryParams = new URLSearchParams();
    
    // Agregar user_name como query parameter si se proporciona
    if (user_name && user_name.trim()) {
      const preparedUserName = prepareSearchTerm(user_name);
      queryParams.append('user_name', preparedUserName);
    }
    
    // Agregar query parameters a la URL si existen
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const response = await axios.post(url, requestBody);
    
    // Verificar si es un resultado válido (éxito o búsqueda sin resultados)
    if (response.data.status === true || response.data.status === 'true' || response.data.status_Message === "No se encontraron usuarios") {
      
      return response.data;
    } else {
      showError(response.data.status_Message || 'Error al cargar clientes');
      throw new Error(response.data.status_Message || 'Error al cargar clientes');
    }
  } catch (error) {
    console.error('Error loading clients:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar clientes';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Get client by ID
 * @param {number} userId - User ID
 * @returns {Promise} Promise with user data
 */
export const getClientById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/get-client/${userId}`);
    
    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      showError(response.data.status_Message || 'Error al cargar cliente');
      throw new Error(response.data.status_Message || 'Error al cargar cliente');
    }
  } catch (error) {
    console.error('Error loading client:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar cliente';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Create new client
 * @param {Object} clientData - Client data to create
 * @returns {Promise} Promise with creation result
 */
export const createClient = async (clientData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/add-client`, clientData);
    
    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      showError(response.data.status_Message || 'Error al crear cliente');
      throw new Error(response.data.status_Message || 'Error al crear cliente');
    }
  } catch (error) {
    console.error('Error creating client:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al crear cliente';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Update existing client
 * @param {Object} clientData - Client data to update
 * @returns {Promise} Promise with update result
 */
export const updateClient = async (clientData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/update-client`, clientData);
    
    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      showError(response.data.status_Message || 'Error al actualizar cliente');
      throw new Error(response.data.status_Message || 'Error al actualizar cliente');
    }
  } catch (error) {
    console.error('Error updating client:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al actualizar cliente';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Toggle client status (activate/deactivate)
 * @param {number} userId - User ID to toggle status
 * @returns {Promise} Promise with toggle result
 */
export const toggleClientStatus = async (userId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/deactivate-client`, {
      user_id: userId
    });
    
    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      showError(response.data.status_Message || 'Error al cambiar el estado del cliente');
      throw new Error(response.data.status_Message || 'Error al cambiar el estado del cliente');
    }
  } catch (error) {
    console.error('Error toggling client status:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cambiar el estado del cliente';
    showError(errorMessage);
    throw error;
  }
};
