import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBook, FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiPackage, FiX } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';
import BooksCard from '../components/books/BooksCard';
import BookInformation from '../components/modals/BookInformation';
import StockUpdateModal from '../components/modals/StockUpdateModal';
import StockIndicator from '../components/ui/StockIndicator';
import Pagination from '../components/ui/Pagination';
import { useProductsInformation } from '../store/useProductsInformation';
import { getProductDetail } from '../api/products';
import { ROUTES } from '../utils/routes';
import placeholderImage from '../assets/images/placeholder.jpg';

const Libros = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Debounce para la búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  // Store de productos
  const {
    products,
    currentPage,
    totalPages,
    totalProducts,
    totalAvailableBooks,
    totalBooks,
    totalDisabledBooks,
    limit,
    isLoading,
    error,
    isInitialized,
    loadProducts,
    refreshProducts,
    goToPage,
    changeLimit
  } = useProductsInformation();

  // Cargar productos al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      loadProducts(currentPage, limit);
    }
  }, [isInitialized, currentPage, limit]); // Solo se ejecuta si no está inicializado

  // Efecto para búsqueda con debounce
  useEffect(() => {
    // Solo ejecutar búsqueda si el término ha cambiado y ya está inicializado
    if (debouncedSearchTerm !== undefined && isInitialized) {
      loadProducts(1, limit, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, limit, isInitialized]); // Solo se ejecuta si está inicializado

  // Detectar si viene de una acción rápida para crear nuevo libro
  useEffect(() => {
    if (location.pathname === ROUTES.BOOKS_CREATE) {
      setShowCreateModal(true);
    }
  }, [location.pathname]);

  // Funciones para manejar productos
  const handleCreateProduct = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setShowCreateModal(true);
  };

  const handleViewProduct = async (product) => {
    try {
      setIsLoadingDetail(true);
      setModalMode('view');
      setSelectedProduct(product); // Mostrar datos básicos mientras carga
      setShowCreateModal(true);
      
      // Obtener detalle completo del producto
      const response = await getProductDetail(product.product_id);
      if (response.status === true) {
        setSelectedProduct(response.product);
      }
    } catch (error) {
      console.error('Error loading product detail:', error);
      // Mantener los datos básicos si falla la carga del detalle
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadProducts(1, limit, '');
  };

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setShowCreateModal(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      setShowCreateModal(false);
      await refreshProducts(debouncedSearchTerm);
    } catch (error) {
      console.error('Error saving product:', error);
      // El error se maneja en el modal, no necesitamos mostrar alert aquí
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedProduct(null);
    setModalMode('view');
  };

  const handleUpdateStock = (product) => {
    setSelectedProductForStock(product);
    setShowStockModal(true);
  };

  const handleStockUpdated = (productId, newStock) => {
    // Actualizar el stock en el store
    const { updateProduct } = useProductsInformation.getState();
    updateProduct(productId, { stock: newStock });
    
  };

  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setSelectedProductForStock(null);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // Función para renderizar estado
  const renderStatus = (status) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
        Inactivo
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Libros
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Administra el catálogo completo de libros infantiles
          </p>
        </div>
        
        <button 
          onClick={handleCreateProduct}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nuevo Libro</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Card - Total Libros */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiBook className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Total Libros</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-blue-600">
                {isLoading ? '...' : totalBooks}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">En catálogo</p>
            </div>
          </div>
        </div>
        
        {/* Card - Libros Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiBook className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Libros Disponibles</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-green-600">
                {isLoading ? '...' : totalAvailableBooks}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Disponibles</p>
            </div>
          </div>
        </div>
        
        {/* Card - Libros Desactivados */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiBook className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Libros Desactivados</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-red-600">
                {isLoading ? '...' : totalDisabledBooks}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">No disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Buscar libros por nombre..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 lg:pl-10 pr-20 lg:pr-24 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm lg:text-base"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-12 lg:right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <FiX className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
              )}
              <button 
                onClick={() => refreshProducts(debouncedSearchTerm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Actualizar"
              >
                <FiRefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Estado de búsqueda - Separado para no afectar el layout */}
        {searchTerm && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500 font-cabin-regular">
              Buscando: "{searchTerm}" • {debouncedSearchTerm !== searchTerm ? 'Escribiendo...' : 'Buscando...'}
            </p>
          </div>
        )}
      </div>

      {/* Lista de libros */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-cabin-medium">Cargando libros...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-cabin-medium">{error}</p>
            <button 
              onClick={() => refreshProducts(debouncedSearchTerm)}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              {searchTerm ? (
                <>
                  <FiSearch className="w-16 h-16 text-gray-300" />
                  <div className="text-gray-500 font-cabin-regular">
                    <p className="font-cabin-medium mb-1">No se encontraron libros</p>
                    <p className="text-sm">que coincidan con "{searchTerm}"</p>
                    <p className="text-xs mt-2">Intenta con otro término de búsqueda</p>
                  </div>
                </>
              ) : (
                <>
                  <FiBook className="w-16 h-16 text-gray-400" />
                  <p className="text-gray-600 font-cabin-medium">No hay libros disponibles</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tabla de libros */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Libro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Stock</span>
                        <FiPackage className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              src={product.main_image_url || placeholderImage}
                              alt={product.product_name}
                              className="h-12 w-12 rounded-lg object-cover shadow-sm"
                              onError={(e) => {
                                e.target.src = placeholderImage;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-cabin-semibold text-gray-900">
                              {product.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category_list?.map(cat => cat.category_name).join(', ') || 'Sin categoría'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.product_type === 'FISICO' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {product.product_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${product.price_offer?.toFixed(2) || product.price?.toFixed(2)}
                        </div>
                        {product.discount > 0 && (
                          <div className="text-sm text-red-600">
                            -{Math.round(product.discount)}% descuento
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdateStock(product)}
                          className="group w-full text-left hover:bg-blue-50 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          title={`Actualizar stock de "${product.product_name}" (actual: ${product.stock || 0} unidades)`}
                          aria-label={`Actualizar stock de ${product.product_name}`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <div className="text-sm font-cabin-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {product.stock || 0} unidades
                              </div>
                              <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
                                <StockIndicator 
                                  stock={product.stock || 0} 
                                  showLabel={true}
                                  size="sm"
                                />
                              </div>
                            </div>
                            <FiPackage className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="text-amber-600 hover:text-amber-900 p-1"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Editar"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900 p-1 hidden"
                            title="Eliminar"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProducts}
                itemsPerPage={limit}
                onPageChange={(page) => goToPage(page, debouncedSearchTerm)}
                onItemsPerPageChange={(newLimit) => changeLimit(newLimit, debouncedSearchTerm)}
                itemsPerPageOptions={[8, 16, 24, 32]}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal de información del libro */}
      {showCreateModal && (
      <BookInformation 
          book={selectedProduct}
        isOpen={showCreateModal}
          onClose={handleCloseModal}
          mode={modalMode}
          onSave={handleSaveProduct}
          isLoadingDetail={isLoadingDetail}
        />
      )}

      {/* Modal de actualización de stock */}
      {showStockModal && selectedProductForStock && (
        <StockUpdateModal
          product={selectedProductForStock}
          isOpen={showStockModal}
          onClose={handleCloseStockModal}
          onStockUpdated={handleStockUpdated}
          currentStock={selectedProductForStock.stock || 0}
        />
      )}
    </div>
  );
};

export default Libros; 