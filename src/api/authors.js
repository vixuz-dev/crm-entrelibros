import axios from '../utils/axiosConfig';
import { showAuthorCreated, showAuthorUpdated, showAuthorDeleted, showError } from '../utils/notifications';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Add new author
 * @param {Object} authorData - Author data to create
 * @param {string} authorData.author_name - Author name
 * @returns {Promise} Promise with creation result
 */
export const addAuthor = async (authorData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/authors/add-author`, authorData);
    
    if (response.data.status === true || response.data.status === 'true') {
      showAuthorCreated(authorData.author_name);
    }
    
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.status_Message || 'Error al crear el autor';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Update existing author
 * @param {Object} authorData - Author data to update
 * @param {string} authorData.author_id - Author ID
 * @param {string} authorData.author_name - Author name
 * @param {boolean} authorData.status - Author status
 * @returns {Promise} Promise with update result
 */
export const updateAuthor = async (authorData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/authors/update-author`, authorData);
    
    if (response.data.status === true || response.data.status === 'true') {
      showAuthorUpdated(authorData.author_name);
    } else {
      showError(response.data.status_Message || 'Error al actualizar el autor');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error updating author:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al actualizar el autor';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Toggle author status (activate/deactivate)
 * @param {string} authorId - Author ID to toggle status
 * @returns {Promise} Promise with toggle result
 */
export const toggleAuthorStatus = async (authorId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/authors/deactivate-author`, {
      author_id: authorId
    });
    
    
    if (response.data.status === true || response.data.status === 'true') {
      showAuthorUpdated(`Autor #${authorId}`);

      showError(response.data.status_Message || 'Error al cambiar el estado del autor');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error toggling author status:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cambiar el estado del autor';
    showError(errorMessage);
    throw error;
  }
};


