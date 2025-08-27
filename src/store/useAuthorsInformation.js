import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthorsInformation = create(
  persist(
    (set, get) => ({
      authors: [],
      currentPage: 1,
      totalPages: 0,
      totalAuthors: 0,
      limit: 8,
      isLoading: false,
      error: null,

      setAuthors: (authors) => set({ authors }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setTotalAuthors: (totalAuthors) => set({ totalAuthors }),
      setLimit: (limit) => set({ limit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loadAuthors: async () => {
        try {
          set({ isLoading: true, error: null });
          const { getAuthors } = await import('../api/authors');
          const response = await getAuthors();

          if (response.status === true) {
            const authors = response.author_list || [];
            const totalAuthors = authors.length;
            const totalPages = Math.ceil(totalAuthors / get().limit);
            
            set({
              authors: authors,
              currentPage: 1,
              totalPages: totalPages,
              totalAuthors: totalAuthors,
              isLoading: false
            });
            console.log('Authors loaded successfully:', response);
          } else {
            set({
              error: response.status_Message || 'Error al cargar autores',
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error loading authors:', error);
          set({
            error: error.message || 'Error al cargar autores',
            isLoading: false
          });
        }
      },

      refreshAuthors: async () => {
        await get().loadAuthors();
      },

      goToPage: (page) => {
        const { limit, totalAuthors } = get();
        const totalPages = Math.ceil(totalAuthors / limit);
        
        if (page >= 1 && page <= totalPages) {
          set({ currentPage: page });
        }
      },

      changeLimit: (newLimit) => {
        const { totalAuthors } = get();
        const totalPages = Math.ceil(totalAuthors / newLimit);
        set({ 
          limit: newLimit, 
          currentPage: 1,
          totalPages: totalPages 
        });
      },

      clearAuthors: () => {
        set({
          authors: [],
          currentPage: 1,
          totalPages: 0,
          totalAuthors: 0,
          limit: 8,
          isLoading: false,
          error: null
        });
      },

      addAuthor: (newAuthor) => {
        const { authors } = get();
        set({ authors: [newAuthor, ...authors] });
      },

      updateAuthor: (authorId, updatedAuthor) => {
        const { authors } = get();
        const updatedAuthors = authors.map(author =>
          author.author_id === authorId ? { ...author, ...updatedAuthor } : author
        );
        set({ authors: updatedAuthors });
      },

      removeAuthor: (authorId) => {
        const { authors } = get();
        const filteredAuthors = authors.filter(author => author.author_id !== authorId);
        set({ authors: filteredAuthors });
      },

      // Obtener autores paginados para mostrar en la tabla
      getPaginatedAuthors: () => {
        const { authors, currentPage, limit } = get();
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return authors.slice(startIndex, endIndex);
      }
    }),
    {
      name: 'authors-information',
      partialize: (state) => ({
        authors: state.authors,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalAuthors: state.totalAuthors,
        limit: state.limit
      })
    }
  )
);
