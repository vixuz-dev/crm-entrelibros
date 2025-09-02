import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrdersInformation = create(
  persist(
    (set, get) => ({
      orders: [],
      currentPage: 1,
      totalPages: 0,
      totalOrders: 0,
      totalPendingOrder: 0,
      totalDeliveryOrders: 0,
      limit: 8,
      isLoading: false,
      error: null,
      isInitialized: false,
      lastLoadTime: 0, // Para evitar llamadas muy cercanas

      setOrders: (orders) => set({ orders }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setTotalOrders: (totalOrders) => set({ totalOrders }),
      setTotalPendingOrder: (totalPendingOrder) => set({ totalPendingOrder }),
      setTotalDeliveryOrders: (totalDeliveryOrders) => set({ totalDeliveryOrders }),
      setLimit: (limit) => set({ limit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loadOrders: async (page = 1, limit = 8) => {
        try {
          // Evitar llamadas duplicadas si ya está cargando
          const currentState = get();
          const now = Date.now();
          
          if (currentState.isLoading) {
            return;
          }
          
          // Evitar llamadas muy cercanas (menos de 100ms)
          if (now - currentState.lastLoadTime < 100) {
            return;
          }
          
          
          set({ isLoading: true, error: null, lastLoadTime: now });
          const { getProductOrders } = await import('../api/orders');
          const response = await getProductOrders(page, limit);

          if (response.status === true) {
            set({
              orders: response.orders || [],
              currentPage: page,
              totalPages: response.total_pages || 0,
              totalOrders: response.totalOrders || 0,
              totalPendingOrder: response.totalPendingOrder || 0,
              totalDeliveryOrders: response.totalDeliveryOrders || 0,
              limit: limit,
              isLoading: false,
              isInitialized: true
            });
    
          } else {
            set({
              error: response.status_Message || 'Error al cargar órdenes',
              isLoading: false,
              isInitialized: true
            });
          }
        } catch (error) {
          console.error('Error loading orders:', error);
          set({
            error: error.message || 'Error al cargar órdenes',
            isLoading: false,
            isInitialized: true
          });
        }
      },

      refreshOrders: async () => {
        const { currentPage, limit } = get();
        await get().loadOrders(currentPage, limit);
      },

      goToPage: async (page) => {
        const { limit } = get();
        await get().loadOrders(page, limit);
      },

      changeLimit: async (newLimit) => {
        await get().loadOrders(1, newLimit);
      },

      clearOrders: () => {
        set({
          orders: [],
          currentPage: 1,
          totalPages: 0,
          totalOrders: 0,
          totalPendingOrder: 0,
          totalDeliveryOrders: 0,
          limit: 8,
          isLoading: false,
          error: null,
          isInitialized: false
        });
      },

      addOrder: (newOrder) => {
        const { orders } = get();
        set({ orders: [newOrder, ...orders] });
      },

      updateOrder: (orderId, updatedOrder) => {
        const { orders } = get();
        const updatedOrders = orders.map(order =>
          order.order_id === orderId ? { ...order, ...updatedOrder } : order
        );
        set({ orders: updatedOrders });
      },

      removeOrder: (orderId) => {
        const { orders } = get();
        const filteredOrders = orders.filter(order => order.order_id !== orderId);
        set({ orders: filteredOrders });
      },

      // Getters útiles
      getOrderById: (orderId) => {
        const { orders } = get();
        return orders.find(order => order.order_id === orderId);
      },

      getOrdersByUser: (userId) => {
        const { orders } = get();
        return orders.filter(order => order.user_id === userId);
      },

      getRecentOrders: (count = 5) => {
        const { orders } = get();
        return orders.slice(0, count);
      },

      getOrdersByDateRange: (startDate, endDate) => {
        const { orders } = get();
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }
    }),
    {
      name: 'orders-information',
      partialize: (state) => ({
        orders: state.orders,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalOrders: state.totalOrders,
        limit: state.limit
      })
    }
  )
);
