import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Usar axios sin interceptores para evitar problemas de CORS
const publicAxios = axios.create();

export const getCategories = async () => {
  try {
    const response = await publicAxios.get(`${API_BASE_URL}/categories/get-categories`);
    console.log('Categories fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
