import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBook, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiRefreshCw } from 'react-icons/fi';
import BooksCard from '../components/books/BooksCard';
import BookInformation from '../components/modals/BookInformation';
import Pagination from '../components/ui/Pagination';
import { useProductsInformation } from '../store/useProductsInformation';
import { getProductDetail } from '../api/products';
import { ROUTES } from '../utils/routes';
import placeholderImage from '../assets/images/placeholder.jpg';

const Libros = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Store de productos
  const {
    products,
    currentPage,
    totalPages,
    totalProducts,
    limit,
    isLoading,
    error,
    loadProducts,
    refreshProducts,
    goToPage,
    changeLimit
  } = useProductsInformation();

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setShowCreateModal(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (modalMode === 'create') {
        // TODO: Implementar creación de producto
        console.log('Creating product:', productData);
      } else {
        // TODO: Implementar edición de producto
        console.log('Editing product:', productData);
      }
      setShowCreateModal(false);
      await refreshProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto. Por favor intenta de nuevo.');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedProduct(null);
    setModalMode('view');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Libros
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra el catálogo completo de libros infantiles
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={refreshProducts}
            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Actualizar"
          >
            <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={handleCreateProduct}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Nuevo Libro</span>
          </button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card - Total Libros */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total Libros</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">
                {isLoading ? '...' : totalProducts}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">En catálogo</p>
            </div>
          </div>
        </div>
        
        {/* Card - Libros Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Libros Activos</h3>
              <p className="text-2xl font-cabin-bold text-green-600">
                {isLoading ? '...' : products.filter(p => p.status === 1).length}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">Disponibles</p>
            </div>
          </div>
        </div>
        
        {/* Card - Libros Físicos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Libros Físicos</h3>
              <p className="text-2xl font-cabin-bold text-amber-600">
                {isLoading ? '...' : products.filter(p => p.product_type === 'FISICO').length}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">En inventario</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar libros por nombre, autor o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
              <FiFilter className="w-5 h-5" />
            </button>
          </div>
        </div>
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
              onClick={refreshProducts}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-cabin-medium">No hay libros disponibles</p>
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
                      Stock
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
                            -{product.discount}% descuento
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatus(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.stock || 0} unidades
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.stock > 10 ? 'Disponible' : product.stock > 0 ? 'Stock bajo' : 'Agotado'}
                        </div>
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
                            onClick={() => console.log('Delete product:', product.product_id)}
                            className="text-red-600 hover:text-red-900 p-1"
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
                onPageChange={goToPage}
                onItemsPerPageChange={changeLimit}
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
    </div>
  );
};

export default Libros; 