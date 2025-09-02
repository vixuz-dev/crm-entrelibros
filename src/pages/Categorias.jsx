import React, { useState, useEffect } from 'react';
import { FiGrid, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiBook, FiRefreshCw, FiUserX, FiUserCheck } from 'react-icons/fi';
import CategoryInformation from '../components/modals/CategoryInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useCategories } from '../hooks/useCatalogs';
import { addCategory, updateCategory, toggleCategoryStatus } from '../api/categories';

const Categorias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [categoryToDeactivate, setCategoryToDeactivate] = useState(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [categoryToActivate, setCategoryToActivate] = useState(null);

  const {
    categories,
    totalCategories,
    totalAvailableCategories,
    totalDisabledCategories,
    isLoading,
    error,
    isInitialized,
    refreshCategories
  } = useCategories();

  // Estado local para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Filtrar categorías basado en el término de búsqueda y estado
  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      category.category_name?.toLowerCase().includes(searchLower) ||
      category.category_description?.toLowerCase().includes(searchLower)
    );
    
    // Filtrar por estado
    if (selectedStatus === 'all') {
      return matchesSearch;
    } else if (selectedStatus === 'active') {
      return matchesSearch && category.status === true;
    } else if (selectedStatus === 'inactive') {
      return matchesSearch && category.status === false;
    }
    
    return matchesSearch;
  });

  // Calcular paginación
  const filteredTotalCategories = filteredCategories.length;
  const totalPages = Math.ceil(filteredTotalCategories / limit);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * limit, currentPage * limit);

  // Funciones de paginación
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const changeLimit = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    return status === true 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (modalMode === 'create') {
        // Crear nueva categoría
        const response = await addCategory(categoryData);
        
        if (response.status === true || response.status === 'true') {
          // Recargar la lista de categorías
          await refreshCategories();
          // Cerrar modal
          setIsModalOpen(false);
        } else {
          alert(response.status_Message || 'Error al crear la categoría');
        }
      } else if (modalMode === 'edit' && selectedCategory) {
        // Editar categoría existente
        const updateData = {
          category_id: selectedCategory.category_id,
          category_name: categoryData.category_name,
          category_description: categoryData.category_description,
          status: true
        };
        
        const response = await updateCategory(updateData);
        
        if (response.status === true || response.status === 'true') {
          // Recargar la lista de categorías
          await refreshCategories();
          // Cerrar modal
          setIsModalOpen(false);
        } else {
          alert(response.status_Message || 'Error al actualizar la categoría');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      // El error ya se maneja en el servicio con notificaciones
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCategory = () => {

    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
    refreshCategories();
  };

  const cancelDeleteCategory = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleDeactivateCategory = (category) => {
    setCategoryToDeactivate(category);
    setIsDeactivateModalOpen(true);
  };

  const confirmDeactivateCategory = async () => {
    if (categoryToDeactivate) {
      try {
        const response = await toggleCategoryStatus(categoryToDeactivate.category_id);
        
        if (response.status === true || response.status === 'true') {          
          await refreshCategories();
        }
      } catch (error) {
        console.error('Error toggling category status:', error);
        // El error ya se maneja en el servicio con notificaciones
      }
    }
    setIsDeactivateModalOpen(false);
    setCategoryToDeactivate(null);
  };

  const cancelDeactivateCategory = () => {
    setIsDeactivateModalOpen(false);
    setCategoryToDeactivate(null);
  };

  const handleActivateCategory = (category) => {
    setCategoryToActivate(category);
    setIsActivateModalOpen(true);
  };

  const confirmActivateCategory = async () => {
    if (categoryToActivate) {
      try {
        const response = await toggleCategoryStatus(categoryToActivate.category_id);
        
        if (response.status === true || response.status === 'true') {
          // Recargar la lista de categorías
          await refreshCategories();
        }
      } catch (error) {
        console.error('Error toggling category status:', error);
        // El error ya se maneja en el servicio con notificaciones
      }
    }
    setIsActivateModalOpen(false);
    setCategoryToActivate(null);
  };

  const cancelActivateCategory = () => {
    setIsActivateModalOpen(false);
    setCategoryToActivate(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setModalMode('view');
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Categorías
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Administra las categorías de libros del sistema
          </p>
        </div>
        
        <button 
          onClick={handleCreateCategory}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nueva Categoría</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card - Total de Categorías */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiGrid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total de Categorías</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">
                {isLoading ? '...' : totalCategories}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">En el sistema</p>
            </div>
          </div>
        </div>
        
        {/* Card - Categorías Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiGrid className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Categorías Disponibles</h3>
              <p className="text-2xl font-cabin-bold text-green-600">
                {isLoading ? '...' : totalAvailableCategories}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">Activas</p>
            </div>
          </div>
        </div>
        
        {/* Card - Categorías Desactivadas */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiGrid className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Categorías Desactivadas</h3>
              <p className="text-2xl font-cabin-bold text-red-600">
                {isLoading ? '...' : totalDisabledCategories}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">Inactivas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Buscar categorías por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-12 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm lg:text-base"
              />
              <button 
                onClick={() => refreshCategories()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Actualizar"
              >
                <FiRefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-3">
            <CustomDropdown
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activas' },
                { value: 'inactive', label: 'Inactivas' }
              ]}
              selectedValues={[selectedStatus]}
              onChange={(values) => setSelectedStatus(values[0])}
              placeholder="Filtrar por estado"
              multiple={false}
              searchable={false}
              className="min-w-[180px]"
            />
            
            {(searchTerm || selectedStatus !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-cabin-medium"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-cabin-medium">Cargando categorías...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-cabin-medium">{error}</p>
            <button
              onClick={refreshCategories}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
                      ) : paginatedCategories.length === 0 ? (
          <div className="p-8 text-center">
            <FiGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-cabin-medium">
              {searchTerm ? 'No se encontraron categorías con ese término' : 'No hay categorías disponibles'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                      ID
                    </th>
                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                      Descripción
                    </th>
                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                      Fecha de Creación
                    </th>
                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr key={category.category_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-cabin-semibold text-gray-800">
                          #{category.category_id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-cabin-semibold text-gray-800">
                          {category.category_name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-cabin-regular text-gray-700">
                          {category.category_description}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(category.status)}`}>
                          {category.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-cabin-regular text-gray-700">
                          {formatDate(category.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewCategory(category)}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          {category.status ? (
                            <button 
                              onClick={() => handleDeactivateCategory(category)}
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Desactivar"
                            >
                              <FiUserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivateCategory(category)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activar"
                            >
                              <FiUserCheck className="w-4 h-4" />
                            </button>
                          )}
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
                totalItems={totalCategories}
                itemsPerPage={limit}
                onPageChange={goToPage}
                onItemsPerPageChange={changeLimit}
                itemsPerPageOptions={[5, 8, 12, 16]}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal de Información de la Categoría */}
      <CategoryInformation 
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveCategory}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Categoría"
        description={`¿Estás seguro de que quieres eliminar la categoría "${categoryToDelete?.category_name}"? Esta acción no se puede deshacer.`}
        onCancel={cancelDeleteCategory}
        onAccept={confirmDeleteCategory}
        cancelText="Cancelar"
        acceptText="Eliminar"
        type="danger"
      />

      {/* Modal de Confirmación de Cambio de Estado */}
      <ConfirmationModal
        isOpen={isDeactivateModalOpen}
        title="Cambiar Estado de la Categoría"
        description={`¿Estás seguro de que quieres cambiar el estado de la categoría "${categoryToDeactivate?.category_name}"?`}
        onCancel={cancelDeactivateCategory}
        onAccept={confirmDeactivateCategory}
        cancelText="Cancelar"
        acceptText="Cambiar Estado"
        type="warning"
      />

      {/* Modal de Confirmación de Cambio de Estado */}
      <ConfirmationModal
        isOpen={isActivateModalOpen}
        title="Cambiar Estado de la Categoría"
        description={`¿Estás seguro de que quieres cambiar el estado de la categoría "${categoryToActivate?.category_name}"?`}
        onCancel={cancelActivateCategory}
        onAccept={confirmActivateCategory}
        cancelText="Cancelar"
        acceptText="Cambiar Estado"
        type="warning"
      />
    </div>
  );
};

export default Categorias; 