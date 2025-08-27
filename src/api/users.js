import axios from '../utils/axiosConfig';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get users with pagination
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Number of items per page
 * @returns {Promise} Promise with users data
 */
export const getUsers = async (page = 1, limit = 5) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/get-users`, {
      page,
      limit
    });
    
    console.log('Users fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Add new admin user
 * @param {Object} userData - User data to create
 * @param {string} userData.user_email - User email
 * @param {string} userData.user_password - User password (will be encrypted)
 * @param {string} userData.user_name - User name
 * @param {string} userData.user_paternal_lastname - User paternal lastname
 * @param {string} userData.user_maternal_lastname - User maternal lastname
 * @param {string} userData.user_phone - User phone
 * @returns {Promise} Promise with creation result
 */
export const addUserAdmin = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/add-user-admin`, userData);
    
    console.log('User created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
