import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getClients } from '../api/users';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useClientsStore = create(
  persist(
    (set, get) => ({
      // Estado de los clientes
      clients: [],
      currentPage: 1,
      totalPages: 0,
      totalClients: 0,
      limit: 8,
      isLoading: false,
      error: null,
      isInitialized: false,
      lastLoadTime: 0, // Para evitar llamadas muy cercanas

      // Setters
      setClients: (clients) => set({ clients }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setTotalClients: (totalClients) => set({ totalClients }),
      setLimit: (limit) => set({ limit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      // Función para cargar clientes
      loadClients: async (page = 1, limit = 8, user_name = '') => {
        try {
          // Evitar llamadas duplicadas si ya está cargando
          const currentState = get();
          const now = Date.now();
          
          if (currentState.isLoading) {
            console.log('🚫 loadClients: Ya está cargando, evitando llamada duplicada');
            return;
          }
          
          // Evitar llamadas muy cercanas (menos de 100ms)
          if (now - currentState.lastLoadTime < 100) {
            console.log('🚫 loadClients: Llamada muy cercana, evitando duplicado');
            return;
          }
          
          console.log('📞 loadClients llamado:', { page, limit, user_name, isInitialized: currentState.isInitialized, timestamp: now });
          
          set({ isLoading: true, error: null, lastLoadTime: now });
          const response = await getClients(page, limit, user_name);

          // Verificar si la respuesta es exitosa o si es un resultado válido de búsqueda sin resultados
          if (response.status === true || response.status === 'true' || response.status_Message === "No se encontraron usuarios") {
            set({
              clients: response.users || [],
              currentPage: page,
              totalPages: response.total_pages || 0,
              totalClients: response.users ? response.users.length : 0,
              limit: limit,
              isLoading: false,
              isInitialized: true,
              error: null // Limpiar cualquier error previo
            });
            
            
          } else {
            set({
              error: response.status_Message || 'Error al cargar clientes',
              isLoading: false,
              isInitialized: true
            });
          }
        } catch (error) {
          console.error('Error loading clients:', error);
          set({
            error: error.message || 'Error al cargar clientes',
            isLoading: false,
            isInitialized: true
          });
        }
      },

      // Función para refrescar clientes
      refreshClients: async (user_name = '') => {
        const { currentPage, limit } = get();
        await get().loadClients(currentPage, limit, user_name);
      },

      // Función para ir a una página específica
      goToPage: async (page, user_name = '') => {
        const { limit } = get();
        await get().loadClients(page, limit, user_name);
      },

      // Función para cambiar el límite de items por página
      changeLimit: async (newLimit, user_name = '') => {
        await get().loadClients(1, newLimit, user_name);
      },

      // Función para limpiar el store
      clearClients: () => {
        set({
          clients: [],
          currentPage: 1,
          totalPages: 0,
          totalClients: 0,
          limit: 8,
          isLoading: false,
          error: null,
          isInitialized: false,
          lastLoadTime: 0
        });
      },

      // Función para agregar un cliente
      addClient: (newClient) => {
        const { clients } = get();
        set({ clients: [newClient, ...clients] });
      },

      // Función para actualizar un cliente
      updateClient: (clientId, updatedClient) => {
        const { clients } = get();
        const updatedClients = clients.map(client =>
          client.user_id === clientId ? { ...client, ...updatedClient } : client
        );
        set({ clients: updatedClients });
      },

      // Función para remover un cliente
      removeClient: (clientId) => {
        const { clients } = get();
        const filteredClients = clients.filter(client => client.user_id !== clientId);
        set({ clients: filteredClients });
      },

      // Getters útiles
      getClientById: (clientId) => {
        const { clients } = get();
        return clients.find(client => client.user_id === clientId);
      },

      getActiveClients: () => {
        const { clients } = get();
        return clients.filter(client => client.status === 1);
      },

      getInactiveClients: () => {
        const { clients } = get();
        return clients.filter(client => client.status === 0);
      },

      // Función para obtener el nombre completo del cliente
      getClientFullName: (client) => {
        if (!client) return 'N/A';
        
        const name = client.name || '';
        const paternal = client.paternal_lastname || '';
        const maternal = client.maternal_lastname || '';
        
        const fullName = [name, paternal, maternal].filter(part => part.trim()).join(' ');
        return fullName || 'Sin nombre';
      },

      // Función para obtener clientes con información completa
      getClientsWithFullInfo: () => {
        const { clients, getClientFullName } = get();
        return clients.map(client => ({
          ...client,
          fullName: getClientFullName(client)
        }));
      }
    }),
    {
      name: 'clients-storage',
      partialize: (state) => ({
        clients: state.clients,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalClients: state.totalClients,
        limit: state.limit,
        isInitialized: state.isInitialized
      })
    }
  )
);
