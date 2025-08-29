import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProductsInformation = create(
  persist(
    (set, get) => ({
      products: [],
      currentPage: 1,
      totalPages: 0,
      totalProducts: 0,
      totalAvailableBooks: 0,
      totalBooks: 0,
      totalDisabledBooks: 0,
      limit: 8,
      isLoading: false,
      error: null,
      isInitialized: false,
      lastLoadTime: 0, // Para evitar llamadas muy cercanas

      setProducts: (products) => set({ products }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setTotalProducts: (totalProducts) => set({ totalProducts }),
      setLimit: (limit) => set({ limit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loadProducts: async (page = 1, limit = 8, searchTerm = '') => {
        try {
          // Evitar llamadas duplicadas si ya está cargando
          const currentState = get();
          const now = Date.now();
          
          if (currentState.isLoading) {
            console.log('🚫 loadProducts: Ya está cargando, evitando llamada duplicada');
            return;
          }
          
          // Evitar llamadas muy cercanas (menos de 100ms)
          if (now - currentState.lastLoadTime < 100) {
            console.log('🚫 loadProducts: Llamada muy cercana, evitando duplicado');
            return;
          }
          
          console.log('📞 loadProducts llamado:', { page, limit, searchTerm, isInitialized: currentState.isInitialized, timestamp: now });
      
          set({ isLoading: true, error: null, lastLoadTime: now });
          const { getProducts } = await import('../api/products');
          const response = await getProducts(page, limit, searchTerm);

          if (response.status === true) {
            set({
              products: response.product_list || [],
              currentPage: page,
              totalPages: response.total_pages || 0,
              totalProducts: response.product_list ? response.product_list.length * (response.total_pages || 1) : 0,
              totalAvailableBooks: response.TotalAvailableBooks || 0,
              totalBooks: response.TotalBooks || 0,
              totalDisabledBooks: response.TotalDisabledBooks || 0,
              limit: limit,
              isLoading: false,
              isInitialized: true
            });
    
          } else {
            // Verificar si es el caso específico de "No se encontraron productos"
            if (response.status_Message === "No se encontraron productos") {
              // No es un error, es un resultado válido de búsqueda
              set({
                products: [],
                currentPage: page,
                totalPages: 0,
                totalProducts: 0,
                totalAvailableBooks: 0,
                totalBooks: 0,
                totalDisabledBooks: 0,
                limit: limit,
                isLoading: false,
                error: null,
                isInitialized: true
              });
              
      
            } else {
              // Manejar otros errores reales
              set({
                error: response.status_Message || 'Error al cargar productos',
                isLoading: false
              });
            }
          }
        } catch (error) {
          console.error('Error loading products:', error);
          set({
            error: error.message || 'Error al cargar productos',
            isLoading: false
          });
        }
      },

      refreshProducts: async (searchTerm = '') => {
        const { currentPage, limit } = get();
        await get().loadProducts(currentPage, limit, searchTerm);
      },

      goToPage: async (page, searchTerm = '') => {
        const { limit } = get();
        await get().loadProducts(page, limit, searchTerm);
      },

      changeLimit: async (newLimit, searchTerm = '') => {
        await get().loadProducts(1, newLimit, searchTerm);
      },

      clearProducts: () => {
        set({
          products: [],
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          limit: 8,
          isLoading: false,
          error: null,
          isInitialized: false
        });
      },

      addProduct: (newProduct) => {
        const { products } = get();
        set({ products: [newProduct, ...products] });
      },

      updateProduct: (productId, updatedProduct) => {
        const { products } = get();
        const updatedProducts = products.map(product =>
          product.product_id === productId ? { ...product, ...updatedProduct } : product
        );
        set({ products: updatedProducts });
      },

      removeProduct: (productId) => {
        const { products } = get();
        const filteredProducts = products.filter(product => product.product_id !== productId);
        set({ products: filteredProducts });
      }
    }),
    {
      name: 'products-information',
      partialize: (state) => ({
        products: state.products,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalProducts: state.totalProducts,
        limit: state.limit
      })
    }
  )
);
