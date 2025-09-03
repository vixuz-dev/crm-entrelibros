import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCreditCard, FiPlus, FiSearch, FiFilter, FiEdit, FiEye, FiTrendingUp, FiExternalLink, FiXCircle, FiCheckCircle, FiUsers, FiRefreshCw, FiDollarSign, FiX } from 'react-icons/fi';
import MembershipChart from '../components/charts/MembershipChart';
import MembershipInformation from '../components/modals/MembershipInformation';
import SubscribersList from '../components/subscriptions/SubscribersList';
import CustomDropdown from '../components/ui/CustomDropdown';
import useMembershipsStore from '../store/useMembershipsStore';
import { showSuccess, showError } from '../utils/notifications';

const Membresias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(['all']);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');

  const [showSubscribers, setShowSubscribers] = useState(false);
  const [selectedMembershipForSubscribers, setSelectedMembershipForSubscribers] = useState(null);

  // Store de membresías (ahora incluye suscripciones)
  const { 
    memberships, 
    isLoading, 
    error, 
    isInitialized, 
    loadMemberships, 
    refreshSubscriptions,
    addMembership, 
    updateMembership, 
    removeMembership,
    clearError,
    totalSubscriptions,
    activeSubscriptions
  } = useMembershipsStore();

  // Cargar membresías al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      loadMemberships();
    }
  }, [isInitialized]); // Removido loadMemberships de las dependencias

  // Limpiar error cuando cambie
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError]);

  // Opciones para el filtro de estado
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'activo', label: 'Activas' },
    { value: 'inactivo', label: 'Inactivas' }
  ];

  // Filtrar membresías según el término de búsqueda y estado
  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.membership_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         membership.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter.includes('all') || 
                         (statusFilter.includes('activo') && membership.status === true) ||
                         (statusFilter.includes('inactivo') && membership.status === false);
    
    return matchesSearch && matchesStatus;
  });

  // Datos para el gráfico de progreso mensual (estático por ahora)
  const monthlyProgressData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Suscripciones Activas',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Datos para el gráfico de distribución de suscriptores por membresía (dinámico)
  const subscribersData = {
    labels: memberships.map(m => m.membership_name).slice(0, 4) || ['Sin datos'],
    datasets: [
      {
        data: memberships.slice(0, 4).map(m => m.subscriptions?.length || 0) || [0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const getStatusColor = (status) => {
    return status === true 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const handleViewMembership = (membership) => {
    setSelectedMembership(membership);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCreateMembership = () => {
    setSelectedMembership(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditMembership = (membership) => {
    setSelectedMembership(membership);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveMembership = async (membershipData) => {
    if (modalMode === 'create') {
      // Agregar nueva membresía al store
      addMembership(membershipData);
    } else if (modalMode === 'edit') {
      // Actualizar membresía en el store
      updateMembership(membershipData.membership_id, membershipData);
    }
    
    // Recargar la lista de membresías para asegurar sincronización
    await loadMemberships();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMembership(null);
    setModalMode('view');
  };

  const handleCloseSubscribers = () => {
    setShowSubscribers(false);
    setSelectedMembershipForSubscribers(null);
  };

  const handleToggleStatus = async (membership) => {
    try {
      // Aquí iría la lógica para cambiar el estado en el backend
      // Por ahora solo actualizamos el store local
      updateMembership(membership.membership_id, { status: !membership.status });
      showSuccess(`Membresía ${!membership.status ? 'activada' : 'desactivada'} correctamente`);
    } catch (error) {
      showError('Error al cambiar el estado de la membresía');
    }
  };

  const handleViewSubscribers = (membership) => {
    setSelectedMembershipForSubscribers(membership);
    setShowSubscribers(true);
  };

  const handleRefreshSubscriptions = async () => {
    try {
      await refreshSubscriptions();
      showSuccess('Suscripciones actualizadas correctamente');
    } catch (error) {
      showError('Error al actualizar suscripciones');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-cabin-bold text-gray-800">
                Membresías
              </h1>
              <p className="text-gray-600 font-cabin-regular mt-2">
                Gestiona los planes de suscripción y sus usuarios
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={handleCreateMembership}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-cabin-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Nueva Membresía
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiCreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
              {memberships.length}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Total Membresías
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
              {totalSubscriptions}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Total Suscriptores
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiTrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
              {activeSubscriptions}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Suscripciones Activas
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
              {memberships.filter(m => m.status === true).length}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Membresías Activas
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar membresías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <CustomDropdown
                options={statusOptions}
                selectedValues={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filtrar por estado"
                multiple={true}
                searchable={false}
              />
            </div>
            
            <button
              onClick={handleRefreshSubscriptions}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-cabin-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar Suscripciones
            </button>
          </div>
        </div>

        {/* Gráficos */}
        {memberships.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4">
                Progreso Mensual
              </h3>
              <div className="w-full">
                <MembershipChart data={monthlyProgressData} type="line" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4">
                Distribución de Suscriptores
              </h3>
              <div className="w-full">
                <MembershipChart data={subscribersData} type="doughnut" />
              </div>
            </div>
          </div>
        )}

        {/* Lista de membresías */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-cabin-semibold text-gray-800">
              Lista de Membresías
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-cabin-regular">Cargando membresías...</p>
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-cabin-semibold text-gray-600 mb-2">
                No se encontraron membresías
              </h3>
              <p className="text-gray-500 font-cabin-regular">
                {searchTerm || statusFilter.length > 0 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'No hay membresías creadas aún'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                        Membresía
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                        Suscriptores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMemberships.map((membership) => (
                      <tr key={membership.membership_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiCreditCard className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-cabin-semibold text-gray-800">
                                {membership.membership_name}
                              </div>
                              <div className="text-sm text-gray-500 font-cabin-regular">
                                {membership.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-cabin-semibold text-gray-800">
                            {formatPrice(membership.price)}
                          </div>
                          <div className="text-sm text-gray-500 font-cabin-regular">
                            por mes
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-cabin-semibold text-gray-800">
                              {membership.subscriptions?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500 font-cabin-regular">
                              suscriptores
                            </div>
                          </div>
                          {membership.subscriptions && membership.subscriptions.length > 0 && (
                            <div className="text-xs text-green-600 font-cabin-medium">
                              {membership.subscriptions.filter(s => s.status === 'active').length} activos
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(membership.status)}`}>
                            {membership.status ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-cabin-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/membresias/detalle/${membership.membership_id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Ver detalle completo en nueva página"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => handleViewMembership(membership)}
                              className="text-amber-600 hover:text-amber-900 p-1 rounded"
                              title="Ver información rápida"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleEditMembership(membership)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Editar"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            
                            {membership.subscriptions && membership.subscriptions.length > 0 && (
                              <button
                                onClick={() => handleViewSubscribers(membership)}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                title="Ver suscriptores"
                              >
                                <FiUsers className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleToggleStatus(membership)}
                              className={`p-1 rounded ${
                                membership.status 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={membership.status ? 'Desactivar' : 'Activar'}
                            >
                              {membership.status ? (
                                <FiXCircle className="w-4 h-4" />
                            ) : (
                                <FiCheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Información de la Membresía */}
      <MembershipInformation
        membership={selectedMembership}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveMembership}
      />

      {/* Modal de Suscriptores */}
      {showSubscribers && selectedMembershipForSubscribers && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseSubscribers}
          />
          
          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-4 relative z-[10000]">
            <div className="bg-white rounded-t-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col relative">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-cabin-bold text-gray-800">
                      Usuarios Suscritos
                    </h2>
                    <p className="text-gray-600 font-cabin-regular">
                      {selectedMembershipForSubscribers.membership_name} - {selectedMembershipForSubscribers.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseSubscribers}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <SubscribersList 
                  membership={selectedMembershipForSubscribers}
                  onClose={handleCloseSubscribers}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membresias; 