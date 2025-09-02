import React, { useState, useEffect } from 'react';
import { FiGrid, FiPlus, FiSearch, FiFilter, FiEdit, FiEye, FiBook, FiRefreshCw, FiX, FiCheck } from 'react-icons/fi';
import TopicInformation from '../components/modals/TopicInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useTopics } from '../hooks/useCatalogs';
import { addTopic, updateTopic, toggleTopicStatus } from '../api/topics';

const Temas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [topicToDeactivate, setTopicToDeactivate] = useState(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [topicToActivate, setTopicToActivate] = useState(null);

  const {
    topics,
    totalTopics,
    totalAvailableTopics,
    totalDisabledTopics,
    isLoading,
    error,
    isInitialized,
    refreshTopics
  } = useTopics();

  // Estado local para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Filtrar temas basado en el término de búsqueda y estado
  const filteredTopics = topics.filter(topic => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = topic.topic_name?.toLowerCase().includes(searchLower);
    
    // Filtrar por estado
    if (selectedStatus === 'all') {
      return matchesSearch;
    } else if (selectedStatus === 'active') {
      return matchesSearch && topic.status === true;
    } else if (selectedStatus === 'inactive') {
      return matchesSearch && topic.status === false;
    }
    
    return matchesSearch;
  });

  // Calcular paginación
  const filteredTotalTopics = filteredTopics.length;
  const totalPages = Math.ceil(filteredTotalTopics / limit);
  const paginatedTopics = filteredTopics.slice((currentPage - 1) * limit, currentPage * limit);

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

  const handleViewTopic = (topic) => {
    setSelectedTopic(topic);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCreateTopic = () => {
    setSelectedTopic(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveTopic = async (topicData) => {
    try {
      if (modalMode === 'create') {
        // Crear nuevo tema
        const response = await addTopic(topicData);
        
        if (response.status === true || response.status === 'true') {
  
          // Recargar la lista de temas
          await refreshTopics();
          // Cerrar modal
          setIsModalOpen(false);
        } else {
          alert(response.status_Message || 'Error al crear el tema');
        }
      } else if (modalMode === 'edit' && selectedTopic) {
        // Editar tema existente
        const updateData = {
          topic_id: selectedTopic.topic_id,
          topic_name: topicData.topic_name
        };
        
        const response = await updateTopic(updateData);
        
        if (response.status === true || response.status === 'true') {
  
          // Recargar la lista de temas
          await refreshTopics();
          // Cerrar modal
          setIsModalOpen(false);
        } else {
          alert(response.status_Message || 'Error al actualizar el tema');
        }
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      // El error ya se maneja en el servicio con notificaciones
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
  };



  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
    setModalMode('view');
  };

  // Funciones para activar/desactivar temas
  const handleDeactivateTopic = (topic) => {
    setTopicToDeactivate(topic);
    setIsDeactivateModalOpen(true);
  };

  const confirmDeactivateTopic = async () => {
    if (topicToDeactivate) {
      try {
        const response = await toggleTopicStatus(topicToDeactivate.topic_id);
        
        if (response.status === true || response.status === 'true') {
  
          // Recargar la lista de temas
          await refreshTopics();
        } else {
          console.error('Error deactivating topic:', response);
        }
      } catch (error) {
        console.error('Error deactivating topic:', error);
        // El error ya se maneja en el servicio con notificaciones
      }
    }
    setIsDeactivateModalOpen(false);
    setTopicToDeactivate(null);
  };

  const cancelDeactivateTopic = () => {
    setIsDeactivateModalOpen(false);
    setTopicToDeactivate(null);
  };

  const handleActivateTopic = (topic) => {
    setTopicToActivate(topic);
    setIsActivateModalOpen(true);
  };

  const confirmActivateTopic = async () => {
    if (topicToActivate) {
      try {
        const response = await toggleTopicStatus(topicToActivate.topic_id);
        
        if (response.status === true || response.status === 'true') {
  
          // Recargar la lista de temas
          await refreshTopics();
        } else {
          console.error('Error activating topic:', response);
        }
      } catch (error) {
        console.error('Error activating topic:', error);
        // El error ya se maneja en el servicio con notificaciones
      }
    }
    setIsActivateModalOpen(false);
    setTopicToActivate(null);
  };

  const cancelActivateTopic = () => {
    setIsActivateModalOpen(false);
    setTopicToActivate(null);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Temas
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Administra los temas de libros del sistema
          </p>
        </div>
        
        <button 
          onClick={handleCreateTopic}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nuevo Tema</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Card - Total de Temas */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiGrid className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Total de Temas</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-blue-600">
                {isLoading ? '...' : totalTopics}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">En el sistema</p>
            </div>
          </div>
        </div>
        
        {/* Card - Temas Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiGrid className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Temas Disponibles</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-green-600">
                {isLoading ? '...' : totalAvailableTopics}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Activos</p>
            </div>
          </div>
        </div>
        
        {/* Card - Temas Desactivados */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiGrid className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Temas Desactivados</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-red-600">
                {isLoading ? '...' : totalDisabledTopics}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Inactivos</p>
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
                placeholder="Buscar temas por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-12 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm lg:text-base"
              />
              <button 
                onClick={() => refreshTopics()}
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
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' }
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

      {/* Tabla de Temas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-cabin-medium">Cargando temas...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-cabin-medium">{error}</p>
            <button
              onClick={refreshTopics}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
                      ) : paginatedTopics.length === 0 ? (
          <div className="p-8 text-center">
            <FiGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-cabin-medium">
              {searchTerm ? 'No se encontraron temas con ese término' : 'No hay temas disponibles'}
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
                  {paginatedTopics.map((topic) => (
                    <tr key={topic.topic_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-cabin-semibold text-gray-800">
                          #{topic.topic_id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-cabin-semibold text-gray-800">
                          {topic.topic_name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(topic.status)}`}>
                          {topic.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-cabin-regular text-gray-700">
                          {formatDate(topic.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewTopic(topic)}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditTopic(topic)}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          {topic.status ? (
                            <button 
                              onClick={() => handleDeactivateTopic(topic)}
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Desactivar"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivateTopic(topic)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activar"
                            >
                              <FiCheck className="w-4 h-4" />
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
                totalItems={totalTopics}
                itemsPerPage={limit}
                onPageChange={goToPage}
                onItemsPerPageChange={changeLimit}
                itemsPerPageOptions={[5, 8, 12, 16]}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal de Información del Tema */}
      <TopicInformation 
        topic={selectedTopic}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveTopic}
      />



      {/* Modal de Confirmación de Desactivación */}
      <ConfirmationModal
        isOpen={isDeactivateModalOpen}
        title="Desactivar Tema"
        description={`¿Estás seguro de que quieres desactivar el tema "${topicToDeactivate?.topic_name}"?`}
        onCancel={cancelDeactivateTopic}
        onAccept={confirmDeactivateTopic}
        cancelText="Cancelar"
        acceptText="Desactivar"
        type="danger"
      />

      {/* Modal de Confirmación de Activación */}
      <ConfirmationModal
        isOpen={isActivateModalOpen}
        title="Activar Tema"
        description={`¿Estás seguro de que quieres activar el tema "${topicToActivate?.topic_name}"?`}
        onCancel={cancelActivateTopic}
        onAccept={confirmActivateTopic}
        cancelText="Cancelar"
        acceptText="Activar"
        type="warning"
      />
    </div>
  );
};

export default Temas;
