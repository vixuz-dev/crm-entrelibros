import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProductsInformation = create(
  persist(
    (set, get) => ({
      products: [],
      currentPage: 1,
      totalPages: 0,
      totalProducts: 0,
      limit: 8,
      isLoading: false,
      error: null,

      setProducts: (products) => set({ products }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (totalPages) => set({ totalPages }),
      setTotalProducts: (totalProducts) => set({ totalProducts }),
      setLimit: (limit) => set({ limit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loadProducts: async (page = 1, limit = 8) => {
        try {
          set({ isLoading: true, error: null });
          const { getProducts } = await import('../api/products');
          const response = await getProducts(page, limit);

          if (response.status === true) {
            set({
              products: response.product_list || [],
              currentPage: page,
              totalPages: response.total_pages || 0,
              totalProducts: response.product_list ? response.product_list.length * (response.total_pages || 1) : 0,
              limit: limit,
              isLoading: false
            });
            console.log('Products loaded successfully:', response);
          } else {
            set({
              error: response.status_Message || 'Error al cargar productos',
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error loading products:', error);
          set({
            error: error.message || 'Error al cargar productos',
            isLoading: false
          });
        }
      },

      refreshProducts: async () => {
        const { currentPage, limit } = get();
        await get().loadProducts(currentPage, limit);
      },

      goToPage: async (page) => {
        const { limit } = get();
        await get().loadProducts(page, limit);
      },

      changeLimit: async (newLimit) => {
        await get().loadProducts(1, newLimit);
      },

      clearProducts: () => {
        set({
          products: [],
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          limit: 8,
          isLoading: false,
          error: null
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
