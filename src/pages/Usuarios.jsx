import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import UserInformation from '../components/modals/UserInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useUsersInformation } from '../store/useUsersInformation';
import { createClient, updateClient, toggleClientStatus, createAdminUser } from '../api/users';
import { useDebounce } from '../hooks/useDebounce';

const Usuarios = () => {
  // Store de usuarios
  const {
    users,
    currentPage,
    totalPages,
    totalUsers,
    totalAvailableUsers,
    totalDisabledUsers,
    limit,
    isLoading,
    error,
    isInitialized,
    loadUsers,
    refreshUsers,
    goToPage,
    changeLimit
  } = useUsersInformation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(['all']);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Opciones para el filtro de estado
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' }
  ];

  // Filtrar usuarios por estado
  const filteredUsers = users.filter(user => {
    if (statusFilter.includes('all')) return true;
    
    const isActive = user.status === 'Activo' || user.status === 1 || user.status === true;
    
    if (statusFilter.includes('activo')) return isActive;
    if (statusFilter.includes('inactivo')) return !isActive;
    
    return true;
  });

  // Debounce para la búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  


  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      loadUsers(currentPage, limit);
    }
  }, [isInitialized, currentPage, limit]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    // Solo ejecutar búsqueda si el término ha cambiado y ya está inicializado
    if (debouncedSearchTerm !== undefined && isInitialized) {
      loadUsers(1, limit, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, limit, isInitialized]);

  const getStatusColor = (status) => {
    return status === 'Activo' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const renderStatus = (status) => {
    // Manejar tanto strings como números
    const isActive = status === 'Activo' || status === 1 || status === true;
    
    if (isActive) {
      return (
        <div className="flex items-center gap-2">
          <FiCheck className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-cabin-medium">Activo</span>
        </div>
      );
    } else {
      return (
        <span className="text-red-600 font-cabin-medium">Inactivo</span>
      );
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    
    // Capitalizar la primera letra del mes
    const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
    
    return `${day} de ${monthCapitalized} del ${year}`;
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadUsers(1, limit, '');
  };

  const handleSaveUser = async (userData) => {
    try {
      if (modalMode === 'create') {
        // Crear nuevo usuario administrador
        const response = await createAdminUser(userData);
        
        if (response.status === true) {
  
          // Recargar la lista de usuarios
          await refreshUsers(searchTerm);
          // Cerrar modal
          handleCloseModal();
        } else {
          alert(response.status_Message || 'Error al crear el usuario');
        }
      } else if (modalMode === 'edit' && selectedUser) {
        // Editar usuario existente
        const updateData = {
          user_id: selectedUser.user_id,
          ...userData
        };
        
        const response = await updateClient(updateData);
        
        if (response.status === true) {
  
          // Recargar la lista de usuarios
          await refreshUsers(searchTerm);
          // Cerrar modal
          handleCloseModal();
        } else {
          alert(response.status_Message || 'Error al actualizar el usuario');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar el usuario. Por favor intenta de nuevo.');
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      // Simular eliminación de usuario
      
      // Aquí normalmente harías una llamada a la API para eliminar el usuario
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const cancelDeleteUser = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalMode('view');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Usuarios del Sistema
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Administra el acceso de usuarios a la plataforma
          </p>
        </div>
        
        <button 
          onClick={handleCreateUser}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nuevo Usuario del Sistema</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Card - Total de Usuarios */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Total de Usuarios</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-blue-600">{isLoading ? '...' : totalUsers}</p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">En el sistema</p>
            </div>
          </div>
        </div>
        
        {/* Card - Usuarios Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Usuarios Disponibles</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-green-600">{isLoading ? '...' : totalAvailableUsers}</p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Activos</p>
            </div>
          </div>
        </div>
        
        {/* Card - Usuarios Desactivados */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Usuarios Desactivados</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-red-600">{isLoading ? '...' : totalDisabledUsers}</p>
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
                placeholder="Buscar por nombre de usuario..."
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
                onClick={() => refreshUsers(debouncedSearchTerm)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Actualizar usuarios"
              >
                <FiRefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2 lg:gap-3">
            <CustomDropdown
              options={statusOptions}
              selectedValues={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filtrar por estado"
              multiple={false}
              searchable={false}
              className="min-w-[180px]"
            />
            

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

      {/* Estado de carga y error */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cabin-regular">Cargando usuarios...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-cabin-medium mb-2">Error al cargar usuarios</p>
          <p className="text-red-500 font-cabin-regular text-sm">{error}</p>
          <button
            onClick={() => refreshUsers(debouncedSearchTerm)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-cabin-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de Usuarios */}
      {!isLoading && !error && (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Usuario
                </th>
                    <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                      Email
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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-cabin-semibold text-gray-800">
                            {user.name && user.paternal_lastname ? 
                              `${user.name} ${user.paternal_lastname} ${user.maternal_lastname || ''}`.trim() :
                              user.email
                            }
                          </div>
                          {user.user_type_name && (
                            <div className="text-sm text-gray-500 font-cabin-regular">
                              {user.user_type_name}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-cabin-regular text-gray-700">
                            {user.email}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {renderStatus(user.status)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-cabin-regular text-gray-700">
                            {formatDate(user.created_at)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewUser(user)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 px-6 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          {(searchTerm || (statusFilter.length > 0 && !statusFilter.includes('all'))) ? (
                            <>
                              <FiSearch className="w-12 h-12 text-gray-300" />
                              <div className="text-gray-500 font-cabin-regular">
                                <p className="font-cabin-medium mb-1">No se encontraron usuarios</p>
                                <p className="text-sm">
                                  {searchTerm && `que coincidan con "${searchTerm}"`}
                                  {searchTerm && statusFilter.length > 0 && !statusFilter.includes('all') && ' y '}
                                  {statusFilter.length > 0 && !statusFilter.includes('all') && 'con los filtros aplicados'}
                                </p>
                                <p className="text-xs mt-2">Intenta con otros términos o filtros</p>
                              </div>
                              <div className="flex flex-wrap gap-2 justify-center mt-2">
                                {searchTerm && (
                                  <button
                                    onClick={handleClearSearch}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-cabin-medium text-sm"
                                  >
                                    Limpiar búsqueda
                                  </button>
                                )}
                                {statusFilter.length > 0 && !statusFilter.includes('all') && (
                                  <button
                                    onClick={() => setStatusFilter(['all'])}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-cabin-medium text-sm"
                                  >
                                    Limpiar filtros
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <FiUsers className="w-12 h-12 text-gray-300" />
                              <p className="text-gray-500 font-cabin-regular">
                                No hay usuarios dados de alta en el sistema
                              </p>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => goToPage(page, debouncedSearchTerm)}
              totalItems={totalUsers}
              itemsPerPage={limit}
              onItemsPerPageChange={(newLimit) => changeLimit(newLimit, debouncedSearchTerm)}
            />
          )}
        </>
      )}

      {/* Modal de Información del Usuario */}
      <UserInformation 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveUser}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Usuario"
        description={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
        onCancel={cancelDeleteUser}
        onAccept={confirmDeleteUser}
        cancelText="Cancelar"
        acceptText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default Usuarios; 