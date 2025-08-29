import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCategoriesInformation = create(
  persist(
    (set, get) => ({
      categories: [],
      currentPage: 1,
      totalPages: 0,
      totalCategories: 0,
      totalAvailableCategories: 0,
      totalDisabledCategories: 0,
      limit: 8,
      isLoading: false,
      error: null,

      setCategories: (categories) => set({ categories }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setTotalCategories: (totalCategories) => set({ totalCategories }),
      setLimit: (limit) => set({ limit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loadCategories: async () => {
        try {
          set({ isLoading: true, error: null });
          const { getCategories } = await import('../api/categories');
          const response = await getCategories();

          if (response.status === true) {
            const categories = response.category_list || [];
            const totalCategories = categories.length;
            const totalPages = Math.ceil(totalCategories / get().limit);
            
            set({
              categories: categories,
              currentPage: 1,
              totalPages: totalPages,
              totalCategories: response.totalCategories || totalCategories,
              totalAvailableCategories: response.totalAvailableCategories || 0,
              totalDisabledCategories: response.totalDisabledCategories || 0,
              isLoading: false
            });
    
          } else {
            set({
              error: response.status_Message || 'Error al cargar categorías',
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error loading categories:', error);
          set({
            error: error.message || 'Error al cargar categorías',
            isLoading: false
          });
        }
      },

      refreshCategories: async () => {
        await get().loadCategories();
      },

      goToPage: (page) => {
        const { limit, totalCategories } = get();
        const totalPages = Math.ceil(totalCategories / limit);
        
        if (page >= 1 && page <= totalPages) {
          set({ currentPage: page });
        }
      },

      changeLimit: (newLimit) => {
        const { totalCategories } = get();
        const totalPages = Math.ceil(totalCategories / newLimit);
        set({ 
          limit: newLimit, 
          currentPage: 1,
          totalPages: totalPages 
        });
      },

      clearCategories: () => {
        set({
          categories: [],
          currentPage: 1,
          totalPages: 0,
          totalCategories: 0,
          totalAvailableCategories: 0,
          totalDisabledCategories: 0,
          limit: 8,
          isLoading: false,
          error: null
        });
      },

      addCategory: (newCategory) => {
        const { categories } = get();
        set({ categories: [newCategory, ...categories] });
      },

      updateCategory: (categoryId, updatedCategory) => {
        const { categories } = get();
        const updatedCategories = categories.map(category =>
          category.category_id === categoryId ? { ...category, ...updatedCategory } : category
        );
        set({ categories: updatedCategories });
      },

      removeCategory: (categoryId) => {
        const { categories } = get();
        const filteredCategories = categories.filter(category => category.category_id !== categoryId);
        set({ categories: filteredCategories });
      },

      // Obtener categorías paginadas para mostrar en la tabla
      getPaginatedCategories: () => {
        const { categories, currentPage, limit } = get();
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return categories.slice(startIndex, endIndex);
      }
    }),
    {
      name: 'categories-information',
      partialize: (state) => ({
        categories: state.categories,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalCategories: state.totalCategories,
        limit: state.limit
      })
    }
  )
);
