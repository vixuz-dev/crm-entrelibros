import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTopicsInformation = create(
  persist(
    (set, get) => ({
      topics: [],
      currentPage: 1,
      totalPages: 0,
      totalTopics: 0,
      limit: 8,
      isLoading: false,
      error: null,

      setTopics: (topics) => set({ topics }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setTotalTopics: (totalTopics) => set({ totalTopics }),
      setLimit: (limit) => set({ limit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loadTopics: async () => {
        try {
          set({ isLoading: true, error: null });
          const { getTopics } = await import('../api/topics');
          const response = await getTopics();

          if (response.status === true) {
            const topics = response.topic_list || [];
            const totalTopics = topics.length;
            const totalPages = Math.ceil(totalTopics / get().limit);
            
            set({
              topics: topics,
              currentPage: 1,
              totalPages: totalPages,
              totalTopics: totalTopics,
              isLoading: false
            });
            console.log('Topics loaded successfully:', response);
          } else {
            set({
              error: response.status_Message || 'Error al cargar temas',
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error loading topics:', error);
          set({
            error: error.message || 'Error al cargar temas',
            isLoading: false
          });
        }
      },

      refreshTopics: async () => {
        await get().loadTopics();
      },

      goToPage: (page) => {
        const { limit, totalTopics } = get();
        const totalPages = Math.ceil(totalTopics / limit);
        
        if (page >= 1 && page <= totalPages) {
          set({ currentPage: page });
        }
      },

      changeLimit: (newLimit) => {
        const { totalTopics } = get();
        const totalPages = Math.ceil(totalTopics / newLimit);
        set({ 
          limit: newLimit, 
          currentPage: 1,
          totalPages: totalPages 
        });
      },

      clearTopics: () => {
        set({
          topics: [],
          currentPage: 1,
          totalPages: 0,
          totalTopics: 0,
          limit: 8,
          isLoading: false,
          error: null
        });
      },

      addTopic: (newTopic) => {
        const { topics } = get();
        set({ topics: [newTopic, ...topics] });
      },

      updateTopic: (topicId, updatedTopic) => {
        const { topics } = get();
        const updatedTopics = topics.map(topic =>
          topic.topic_id === topicId ? { ...topic, ...updatedTopic } : topic
        );
        set({ topics: updatedTopics });
      },

      removeTopic: (topicId) => {
        const { topics } = get();
        const filteredTopics = topics.filter(topic => topic.topic_id !== topicId);
        set({ topics: filteredTopics });
      },

      // Obtener temas paginados para mostrar en la tabla
      getPaginatedTopics: () => {
        const { topics, currentPage, limit } = get();
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        return topics.slice(startIndex, endIndex);
      }
    }),
    {
      name: 'topics-information',
      partialize: (state) => ({
        topics: state.topics,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalTopics: state.totalTopics,
        limit: state.limit
      })
    }
  )
);
