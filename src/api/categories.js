import axios from '../utils/axiosConfig';
import { showCategoryCreated, showCategoryUpdated, showCategoryDeleted, showError } from '../utils/notifications';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get all categories
 * @returns {Promise} Promise with categories list
 */
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/get-categories`);
    return response.data;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

/**
 * Add new category
 * @param {Object} categoryData - Category data to create
 * @param {string} categoryData.category_name - Category name
 * @param {string} categoryData.category_description - Category description
 * @returns {Promise} Promise with creation result
 */
export const addCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/categories/add-category`, categoryData);
    
    if (response.data.status === true || response.data.status === 'true') {
      showCategoryCreated(categoryData.category_name);
    } else {
      showError(response.data.status_Message || 'Error al crear la categoría');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al crear la categoría';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Update existing category
 * @param {Object} categoryData - Category data to update
 * @param {string} categoryData.category_id - Category ID
 * @param {string} categoryData.category_name - Category name
 * @param {string} categoryData.category_description - Category description
 * @param {boolean} categoryData.status - Category status (always true)
 * @returns {Promise} Promise with update result
 */
export const updateCategory = async (categoryData) => {
  try {
    // Asegurar que siempre se envíe status: true
    const payload = {
      ...categoryData,
      status: true
    };
    
    const response = await axios.put(`${API_BASE_URL}/categories/update-category`, payload);
    
    if (response.data.status === true || response.data.status === 'true') {
      showCategoryUpdated(categoryData.category_name);
    } else {
      showError(response.data.status_Message || 'Error al actualizar la categoría');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al actualizar la categoría';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Toggle category status (activate/deactivate)
 * @param {string} categoryId - Category ID to toggle status
 * @returns {Promise} Promise with toggle result
 */
export const toggleCategoryStatus = async (categoryId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/categories/deactivate-category`, {
      category_id: categoryId
    });
    
    if (response.data.status === true || response.data.status === 'true') {
      showCategoryUpdated(`Categoría #${categoryId}`);
    } else {
      showError(response.data.status_Message || 'Error al cambiar el estado de la categoría');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error toggling category status:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cambiar el estado de la categoría';
    showError(errorMessage);
    throw error;
  }
};
