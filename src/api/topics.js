import axios from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export const getTopics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/topics/get-topics`);
    console.log('Topics fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};
