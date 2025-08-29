import { useEffect } from 'react';
import { useCatalogStore } from '../store/useCatalogStore';

// Hook para usar catálogos en componentes
export const useCatalogs = () => {
  const {
    categories,
    topics,
    authors,
    isLoading,
    error,
    isInitialized,
    loadAllCatalogs,
    refreshCatalog,
    clearCatalogs,
    getCategoryById,
    getTopicById,
    getAuthorById,
    getActiveCategories,
    getActiveTopics,
    getActiveAuthors
  } = useCatalogStore();

  // Cargar catálogos si no están inicializados
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      loadAllCatalogs();
    }
  }, [isInitialized, isLoading, loadAllCatalogs]);

  return {
    // Datos
    categories,
    topics,
    authors,
    
    // Estado
    isLoading,
    error,
    isInitialized,
    
    // Acciones
    loadAllCatalogs,
    refreshCatalog,
    clearCatalogs,
    
    // Getters
    getCategoryById,
    getTopicById,
    getAuthorById,
    getActiveCategories,
    getActiveTopics,
    getActiveAuthors
  };
};

// Hook específico para categorías
export const useCategories = () => {
  const {
    categories,
    totalCategories,
    totalAvailableCategories,
    totalDisabledCategories,
    isLoading,
    error,
    isInitialized,
    refreshCatalog,
    getCategoryById,
    getActiveCategories
  } = useCatalogStore();

  return {
    categories,
    totalCategories,
    totalAvailableCategories,
    totalDisabledCategories,
    isLoading,
    error,
    isInitialized,
    refreshCategories: () => refreshCatalog('categories'),
    getCategoryById,
    getActiveCategories
  };
};

// Hook específico para temas
export const useTopics = () => {
  const {
    topics,
    totalTopics,
    totalAvailableTopics,
    totalDisabledTopics,
    isLoading,
    error,
    isInitialized,
    refreshCatalog,
    getTopicById,
    getActiveTopics
  } = useCatalogStore();

  return {
    topics,
    totalTopics,
    totalAvailableTopics,
    totalDisabledTopics,
    isLoading,
    error,
    isInitialized,
    refreshTopics: () => refreshCatalog('topics'),
    getTopicById,
    getActiveTopics
  };
};

// Hook específico para autores
export const useAuthors = () => {
  const {
    authors,
    totalAuthors,
    totalAvailableAuthors,
    totalDisabledAuthors,
    isLoading,
    error,
    isInitialized,
    loadAllCatalogs,
    refreshCatalog,
    getAuthorById,
    getActiveAuthors
  } = useCatalogStore();

  // Cargar catálogos si no están inicializados
  useEffect(() => {

    if (!isInitialized && !isLoading) {
      
      loadAllCatalogs();
    }
  }, [isInitialized, isLoading, loadAllCatalogs, authors.length]);

  return {
    authors,
    totalAuthors,
    totalAvailableAuthors,
    totalDisabledAuthors,
    isLoading,
    error,
    isInitialized,
    refreshAuthors: () => refreshCatalog('authors'),
    getAuthorById,
    getActiveAuthors
  };
};
