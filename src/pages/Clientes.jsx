import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiUsers, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiX } from 'react-icons/fi';
import ClientInformation from '../components/modals/ClientInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useClientsStore } from '../store/useClientsStore';
import { ROUTES } from '../utils/routes';
import { useDebounce } from '../hooks/useDebounce';

const Clientes = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [statusFilter, setStatusFilter] = useState('all');

  // Store de clientes
  const {
    clients,
    currentPage: storeCurrentPage,
    totalPages,
    totalClients,
    limit: storeLimit,
    isLoading,
    error,
    isInitialized,
    loadClients,
    refreshClients,
    goToPage,
    changeLimit,
    getClientFullName,
    getClientsWithFullInfo
  } = useClientsStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Debounce para la búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Cargar clientes al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      loadClients(1, 8);
    }
  }, [isInitialized]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    // Solo ejecutar búsqueda si el término ha cambiado y ya está inicializado
    if (debouncedSearchTerm !== undefined && isInitialized) {
      loadClients(1, 8, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, isInitialized]);

  // Detectar si viene de una acción rápida para crear nuevo cliente
  useEffect(() => {
    if (location.pathname === ROUTES.CUSTOMERS_CREATE) {
      setModalMode('create');
      setIsModalOpen(true);
    }
  }, [location.pathname]);

  // Función para obtener el estado del cliente basado en status
  const getClientStatus = (client) => {
    if (client.status === 1) {
      return {
        status: 'activo',
        label: 'Activo',
        color: 'bg-green-100 text-green-800 border-green-200'
      };
    } else {
      return {
        status: 'inactivo',
        label: 'Inactivo',
        color: 'bg-red-100 text-red-800 border-red-200'
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };



  const handleViewClient = (client) => {
    setSelectedClient(client);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteClient = () => {
    // TODO: Implementar eliminación real cuando tengamos el API
    
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
    refreshClients();
  };

  const cancelDeleteClient = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setModalMode('view');
  };

  const handleSaveClient = (clientData) => {
    if (modalMode === 'create') {
      // TODO: Implementar creación real cuando tengamos el API
      
    } else if (modalMode === 'edit') {
      // TODO: Implementar edición real cuando tengamos el API
      
    }
    setIsModalOpen(false);
    refreshClients(searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadClients(1, 8, '');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    loadClients(1, 8, '');
  };



  // Calcular métricas
  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter(client => client.status === 1).length;
  const inactiveClientsCount = clients.filter(client => client.status === 0).length;

  // Filtrar clientes por búsqueda y estado
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.contact_information?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_information?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_information?.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'activo' && client.status === 1) ||
      (statusFilter === 'inactivo' && client.status === 0) ||
      (statusFilter === 'suspendido' && client.status === 2);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Administra todos los clientes del sistema
          </p>
        </div>
        
        {/* <button 
          onClick={handleCreateClient}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nuevo Cliente</span>
        </button> */}
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Card - Total Clientes */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Total Clientes</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-blue-600">{isLoading ? '...' : totalClientsCount}</p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Registrados</p>
            </div>
          </div>
        </div>
        
        {/* Card - Clientes Activos */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Clientes Activos</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-green-600">
                {isLoading ? '...' : activeClientsCount}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Actualmente activos</p>
            </div>
          </div>
        </div>
        
        {/* Card - Nuevos este Mes */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Nuevos este Mes</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-purple-600">3</p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Enero 2024</p>
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
                placeholder="Buscar clientes por nombre de usuario..."
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
                onClick={() => refreshClients(searchTerm)}
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
                { value: 'activo', label: 'Activos' },
                { value: 'inactivo', label: 'Inactivos' },
                { value: 'suspendido', label: 'Suspendidos' }
              ]}
              selectedValues={[statusFilter]}
              onChange={(values) => setStatusFilter(values[0])}
              placeholder="Filtrar por estado"
              multiple={false}
              searchable={false}
              className="min-w-[180px]"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Cliente
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Contacto
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Ubicación
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Estado
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Actividad
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-cabin-medium">Cargando clientes...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <p className="text-red-600 font-cabin-medium">{error}</p>
                    <button 
                      onClick={() => refreshClients(searchTerm)}
                      className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      {searchTerm ? (
                        <>
                          <FiSearch className="w-12 h-12 text-gray-300" />
                          <div className="text-gray-500 font-cabin-regular">
                            <p className="font-cabin-medium mb-1">No se encontraron clientes</p>
                            <p className="text-sm">que coincidan con "{searchTerm}"</p>
                            <p className="text-xs mt-2">Intenta con otro término de búsqueda</p>
                          </div>
                          <button 
                            onClick={handleClearSearch}
                            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-cabin-medium"
                          >
                            Limpiar búsqueda
                          </button>
                        </>
                      ) : (
                        <>
                          <FiUsers className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-cabin-regular">
                            No hay clientes dados de alta en el sistema
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const clientStatus = getClientStatus(client);
                  return (
                    <tr key={client.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-cabin-semibold text-gray-800">
                            {getClientFullName(client)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {client.user_id}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-cabin-regular text-gray-700">
                            {client.email || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.phone || 'Sin teléfono'}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-cabin-regular text-gray-700">
                            {client.user_type_name || 'Cliente'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tipo de usuario
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${clientStatus.color}`}>
                          {clientStatus.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-cabin-regular text-gray-700">
                            {formatDate(client.created_at)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Fecha de registro
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewClient(client)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          {/* <button 
                            onClick={() => handleEditClient(client)}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button> */}
                          {/* <button 
                            onClick={() => handleDeleteClient(client)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Información del Cliente */}
      <ClientInformation 
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveClient}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onCancel={cancelDeleteClient}
        onAccept={confirmDeleteClient}
        title="Eliminar Cliente"
        description={`¿Estás seguro de que quieres eliminar al cliente "${clientToDelete ? getClientFullName(clientToDelete) : ''}"? Esta acción no se puede deshacer.`}
        acceptText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Clientes; 