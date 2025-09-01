import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useCatalogStore = create(
  persist(
    (set, get) => ({
      // Estado de los catálogos
      categories: [],
      topics: [],
      authors: [],
      
      // Totales de categorías
      totalCategories: 0,
      totalAvailableCategories: 0,
      totalDisabledCategories: 0,
      
      // Totales de temas
      totalTopics: 0,
      totalAvailableTopics: 0,
      totalDisabledTopics: 0,
      
      // Totales de autores
      totalAuthors: 0,
      totalAvailableAuthors: 0,
      totalDisabledAuthors: 0,
      
      // Estado de carga
      isLoading: false,
      error: null,
      
      // Estado de inicialización
      isInitialized: false,
      
      // Setters
      setCategories: (categories) => set({ categories }),
      setTopics: (topics) => set({ topics }),
      setAuthors: (authors) => set({ authors }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      
      // Función para cargar todos los catálogos
      loadAllCatalogs: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Cargar categorías (requiere token)
          const categoriesResponse = await axios.get(`${API_BASE_URL}/categories/get-categories`);
          const categoriesData = categoriesResponse.data;
          
          // Cargar temas (requiere token)
          const topicsResponse = await axios.get(`${API_BASE_URL}/topics/get-topics`);
          const topicsData = topicsResponse.data;
          
          // Cargar autores (requiere token)
          const authorsResponse = await axios.get(`${API_BASE_URL}/authors/get-authors`);
          const authorsData = authorsResponse.data;
          
          // Actualizar estado con todos los catálogos
          const categories = categoriesData.status === true ? categoriesData.category_list || [] : [];
          const topics = topicsData.status === true ? topicsData.topic_list || [] : [];
          const authors = authorsData.status === true ? authorsData.author_list || [] : [];
          
          set({
            categories,
            topics,
            authors,
            // Totales de categorías
            totalCategories: categoriesData.totalCategories || 0,
            totalAvailableCategories: categoriesData.totalAvailableCategories || 0,
            totalDisabledCategories: categoriesData.totalDisabledCategories || 0,
            // Totales de temas
            totalTopics: topicsData.totalTopics || 0,
            totalAvailableTopics: topicsData.totalAvailableTopics || 0,
            totalDisabledTopics: topicsData.totalDisabledTopics || 0,
            // Totales de autores
            totalAuthors: authorsData.totalAuthors || 0,
            totalAvailableAuthors: authorsData.totalAvailableAuthors || 0,
            totalDisabledAuthors: authorsData.totalDisabledAuthors || 0,
            isLoading: false,
            isInitialized: true,
            error: null
          });
          

          
        } catch (error) {
          console.error('Error cargando catálogos:', error);
          set({
            error: error.message || 'Error al cargar catálogos',
            isLoading: false
          });
        }
      },
      
      // Función para refrescar un catálogo específico
      refreshCatalog: async (catalogType) => {
        try {
          let response;
          let data;
          
          switch (catalogType) {
            case 'categories':
              response = await axios.get(`${API_BASE_URL}/categories/get-categories`);
              data = response.data;
              if (data.status === true) {
                set({ categories: data.category_list || [] });
              }
              break;
              
            case 'topics':
              response = await axios.get(`${API_BASE_URL}/topics/get-topics`);
              data = response.data;
              if (data.status === true) {
                set({ topics: data.topic_list || [] });
              }
              break;
              
            case 'authors':
              response = await axios.get(`${API_BASE_URL}/authors/get-authors`);
              data = response.data;

              if (data.status === true) {
                const updatedAuthors = data.author_list || [];

                set({ authors: updatedAuthors });
              }
              break;
              
            default:
              throw new Error(`Tipo de catálogo no válido: ${catalogType}`);
          }
          
        } catch (error) {
          console.error(`Error refrescando ${catalogType}:`, error);
          set({ error: error.message });
        }
      },
      
      // Función para limpiar todos los catálogos
      clearCatalogs: () => {
        set({
          categories: [],
          topics: [],
          authors: [],
          isLoading: false,
          error: null,
          isInitialized: false
        });
      },
      
      // Getters útiles
      getCategoryById: (id) => {
        const { categories } = get();
        return categories.find(cat => cat.category_id === id);
      },
      
      getTopicById: (id) => {
        const { topics } = get();
        return topics.find(topic => topic.topic_id === id);
      },
      
      getAuthorById: (id) => {
        const { authors } = get();
        return authors.find(author => author.author_id === id);
      },
      
      getActiveCategories: () => {
        const { categories } = get();
        return categories.filter(cat => cat.status === true);
      },
      
      getActiveTopics: () => {
        const { topics } = get();
        return topics.filter(topic => topic.status === true);
      },
      
      getActiveAuthors: () => {
        const { authors } = get();
        return authors.filter(author => author.status === true);
      }
    }),
    {
      name: 'catalog-store',
      partialize: (state) => ({
        categories: state.categories,
        topics: state.topics,
        authors: state.authors,
        isInitialized: state.isInitialized
      })
    }
  )
);
