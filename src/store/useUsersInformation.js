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
      limit: 5,
      isLoading: false,
      error: null,

      // Acciones
      setUsers: (users) => set({ users }),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setTotalPages: (totalPages) => set({ totalPages }),
      
      setTotalUsers: (totalUsers) => set({ totalUsers }),
      
      setLimit: (limit) => set({ limit }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),

      // Cargar usuarios desde la API
      loadUsers: async (page = 1, limit = 5) => {
        try {
          set({ isLoading: true, error: null });
          
          const { getUsers } = await import('../api/users');
          const response = await getUsers(page, limit);
          
          // Verificar si la respuesta es exitosa
          if (response.status === true) {
            // Actualizar estado con la respuesta de tu API
            set({
              users: response.users || [],
              currentPage: page,
              totalPages: response.total_pages || 0,
              totalUsers: response.users ? response.users.length * (response.total_pages || 1) : 0,
              limit: limit,
              isLoading: false
            });
            
            console.log('Users loaded successfully:', response);
          } else {
            // Manejar respuesta con error
            set({ 
              error: response.status_Message || 'Error al cargar usuarios',
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error loading users:', error);
          set({ 
            error: error.message || 'Error al cargar usuarios',
            isLoading: false 
          });
        }
      },

      // Refrescar usuarios (recargar página actual)
      refreshUsers: async () => {
        const { currentPage, limit } = get();
        await get().loadUsers(currentPage, limit);
      },

      // Ir a página específica
      goToPage: async (page) => {
        const { limit } = get();
        await get().loadUsers(page, limit);
      },

      // Cambiar límite de elementos por página
      changeLimit: async (newLimit) => {
        await get().loadUsers(1, newLimit); // Volver a página 1 con nuevo límite
      },

      // Limpiar estado
      clearUsers: () => {
        set({
          users: [],
          currentPage: 1,
          totalPages: 0,
          totalUsers: 0,
          limit: 5,
          isLoading: false,
          error: null
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
