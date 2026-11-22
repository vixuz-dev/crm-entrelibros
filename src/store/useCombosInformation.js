import { create } from 'zustand';

// Store de la pantalla de Combos. Un combo es un producto que trae `bundle_items` (sus libros).
const isCombo = (p) => Array.isArray(p?.bundle_items) && p.bundle_items.length > 0;

export const useCombosInformation = create((set, get) => ({
  combos: [],
  currentPage: 1,
  totalPages: 0,
  totalCombos: 0,
  totalAvailable: 0,
  totalDisabled: 0,
  limit: 8,
  isLoading: false,
  error: null,
  isInitialized: false,

  loadCombos: async (page = 1, limit = 8, searchTerm = '') => {
    if (get().isLoading) return;
    try {
      set({ isLoading: true, error: null });
      const { getProducts } = await import('../api/products');
      const response = await getProducts(page, limit, searchTerm, { is_bundle: '1' });

      if (response.status === true) {
        // Filtro de respaldo en el cliente por si el backend aún no filtra por is_bundle
        const combos = (response.product_list || []).filter(isCombo);
        set({
          combos,
          currentPage: page,
          limit,
          totalPages: response.total_pages || 0,
          totalCombos: response.TotalBooks ?? combos.length,
          totalAvailable: response.TotalAvailableBooks || 0,
          totalDisabled: response.TotalDisabledBooks || 0,
          isLoading: false,
          isInitialized: true,
        });
      } else if (response.status_Message === 'No existen productos.' || response.status_Message === 'No se encontraron productos') {
        set({ combos: [], currentPage: page, limit, totalPages: 0, totalCombos: 0, isLoading: false, isInitialized: true });
      } else {
        set({ error: response.status_Message || 'Error al cargar los combos', isLoading: false });
      }
    } catch (error) {
      console.error('Error loading combos:', error);
      set({ error: error.message || 'Error al cargar los combos', isLoading: false });
    }
  },

  refreshCombos: async (searchTerm = '') => {
    const { currentPage, limit } = get();
    await get().loadCombos(currentPage, limit, searchTerm);
  },
  goToPage: async (page, searchTerm = '') => get().loadCombos(page, get().limit, searchTerm),
  changeLimit: async (newLimit, searchTerm = '') => get().loadCombos(1, newLimit, searchTerm),
}));
