import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store de Zustand para manejar la información de usuarios con persistencia
 */
export const useUsersInformation = create(
  persist(
    (set, get) => ({
      // Estado de usuarios
      users: [],
      currentPage: 1,
      totalPages: 0,
      totalUsers: 0,
      totalAvailableUsers: 0,
      totalDisabledUsers: 0,
      limit: 5,
      isLoading: false,
      error: null,
      isInitialized: false,
      lastLoadTime: 0, // Para evitar llamadas muy cercanas

      // Acciones
      setUsers: (users) => set({ users }),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setTotalPages: (totalPages) => set({ totalPages }),
      
      setTotalUsers: (totalUsers) => set({ totalUsers }),
      
      setLimit: (limit) => set({ limit }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),

      // Cargar usuarios desde la API
      loadUsers: async (page = 1, limit = 5, user_name = '') => {
        try {
          // Evitar llamadas duplicadas si ya está cargando
          const currentState = get();
          const now = Date.now();
          
          if (currentState.isLoading) {
            console.log('🚫 loadUsers: Ya está cargando, evitando llamada duplicada');
            return;
          }
          
          // Evitar llamadas muy cercanas (menos de 100ms)
          if (now - currentState.lastLoadTime < 100) {
            console.log('🚫 loadUsers: Llamada muy cercana, evitando duplicado');
            return;
          }
          
          console.log('📞 loadUsers llamado:', { page, limit, user_name, isInitialized: currentState.isInitialized, timestamp: now });
      
          set({ isLoading: true, error: null, lastLoadTime: now });
          
          const { getUsers } = await import('../api/users');
          const response = await getUsers(page, limit, user_name);
          
          // Verificar si la respuesta es exitosa o si es un resultado válido de búsqueda sin resultados
          if (response.status === true || response.status === 'true' || response.status_Message === "No se encontraron usuarios") {
            // Actualizar estado con la respuesta de la API
            set({
              users: response.users || [],
              currentPage: page,
              totalPages: response.total_pages || 0,
              totalUsers: response.totalUsers || (response.users ? response.users.length : 0),
              totalAvailableUsers: response.totalAvailableUsers || 0,
              totalDisabledUsers: response.totalDisabledUsers || 0,
              limit: limit,
              isLoading: false,
              isInitialized: true,
              error: null // Limpiar cualquier error previo
            });
            
            
          } else {
            // Manejar otros errores reales
            set({ 
              error: response.status_Message || 'Error al cargar usuarios',
              isLoading: false,
              isInitialized: true
            });
          }
        } catch (error) {
          console.error('Error loading users:', error);
          set({ 
            error: error.message || 'Error al cargar usuarios',
            isLoading: false,
            isInitialized: true
          });
        }
      },

      // Refrescar usuarios (recargar página actual)
      refreshUsers: async (user_name = '') => {
        const { currentPage, limit } = get();
        await get().loadUsers(currentPage, limit, user_name);
      },

      // Ir a página específica
      goToPage: async (page, user_name = '') => {
        const { limit } = get();
        await get().loadUsers(page, limit, user_name);
      },

      // Cambiar límite de elementos por página
      changeLimit: async (newLimit, user_name = '') => {
        await get().loadUsers(1, newLimit, user_name); // Volver a página 1 con nuevo límite
      },

      // Limpiar estado
      clearUsers: () => {
        set({
          users: [],
          currentPage: 1,
          totalPages: 0,
          totalUsers: 0,
          totalAvailableUsers: 0,
          totalDisabledUsers: 0,
          limit: 5,
          isLoading: false,
          error: null,
          isInitialized: false
        });
      },

      // Agregar nuevo usuario
      addUser: (newUser) => {
        const { users } = get();
        set({ users: [newUser, ...users] });
      },

      // Actualizar usuario existente
      updateUser: (userId, updatedUser) => {
        const { users } = get();
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, ...updatedUser } : user
        );
        set({ users: updatedUsers });
      },

      // Eliminar usuario
      removeUser: (userId) => {
        const { users } = get();
        const filteredUsers = users.filter(user => user.id !== userId);
        set({ users: filteredUsers });
      }
    }),
    {
      name: 'users-information', // Nombre para localStorage
      partialize: (state) => ({
        // Solo persistir ciertos campos, no el estado de loading o error
        users: state.users,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalUsers: state.totalUsers,
        limit: state.limit
      })
    }
  )
);
