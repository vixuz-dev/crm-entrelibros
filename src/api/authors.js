import axios from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getAuthors = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/authors/get-authors`);
    console.log('Authors fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};
