import axios from '../utils/axiosConfig';
import { showTopicCreated, showTopicUpdated, showTopicDeleted, showError } from '../utils/notifications';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get all topics
 * @returns {Promise} Promise with topics list
 */
export const getTopics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/topics/get-topics`);
    return response.data;
  } catch (error) {
    console.error('Error getting topics:', error);
    throw error;
  }
};

/**
 * Add new topic
 * @param {Object} topicData - Topic data to create
 * @param {string} topicData.topic_name - Topic name
 * @returns {Promise} Promise with creation result
 */
export const addTopic = async (topicData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/topics/add-topic`, topicData);
    
    if (response.data.status === true || response.data.status === 'true') {
      showTopicCreated(topicData.topic_name);
    } else {
      showError(response.data.status_Message || 'Error al crear el tema');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error creating topic:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al crear el tema';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Update existing topic
 * @param {Object} topicData - Topic data to update
 * @param {string} topicData.topic_id - Topic ID
 * @param {string} topicData.topic_name - Topic name
 * @param {number} topicData.status - Topic status (always 1)
 * @returns {Promise} Promise with update result
 */
export const updateTopic = async (topicData) => {
  try {
    // Asegurar que siempre se envíe status: 1
    const payload = {
      ...topicData,
      status: true
    };
    
    const response = await axios.put(`${API_BASE_URL}/topics/update-topic`, payload);
    
    if (response.data.status === true || response.data.status === 'true') {
      showTopicUpdated(topicData.topic_name);
    } else {
      showError(response.data.status_Message || 'Error al actualizar el tema');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error updating topic:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al actualizar el tema';
    showError(errorMessage);
    throw error;
  }
};

/**
 * Toggle topic status (activate/deactivate)
 * @param {string} topicId - Topic ID to toggle status
 * @returns {Promise} Promise with toggle result
 */
export const toggleTopicStatus = async (topicId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/topics/deactivate-topic`, {
      topic_id: topicId
    });
    
    if (response.data.status === true || response.data.status === 'true') {
      showTopicUpdated(`Tema #${topicId}`);
    } else {
      showError(response.data.status_Message || 'Error al cambiar el estado del tema');
    }
    
    
    return response.data;
  } catch (error) {
    console.error('Error toggling topic status:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cambiar el estado del tema';
    showError(errorMessage);
    throw error;
  }
};
