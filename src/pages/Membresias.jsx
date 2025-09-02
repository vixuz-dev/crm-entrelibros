import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCreditCard, FiPlus, FiSearch, FiFilter, FiEdit, FiEye, FiTrendingUp, FiExternalLink, FiXCircle, FiCheckCircle, FiUsers, FiRefreshCw } from 'react-icons/fi';
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

  // Store de membresías
  const { 
    memberships, 
    isLoading, 
    error, 
    isInitialized, 
    loadMemberships, 
    addMembership, 
    updateMembership, 
    removeMembership,
    clearError 
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

  // Datos para el gráfico de progreso mensual
  const monthlyProgressData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Membresía Básica',
        data: [45, 52, 48, 61, 55, 67],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Membresía Premium',
        data: [32, 38, 35, 42, 39, 45],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Membresía Familiar',
        data: [28, 31, 29, 35, 32, 38],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Datos para el gráfico de total de suscriptores
  const subscribersData = {
    labels: ['Membresía Básica', 'Membresía Premium', 'Membresía Familiar', 'Membresía Anual'],
    datasets: [
      {
        data: [245, 189, 156, 89],
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
        borderWidth: 2
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
      const newStatus = !membership.status;
      await updateMembership(membership.membership_id, {
        ...membership,
        status: newStatus
      });
      // Recargar membresías para actualizar el estado
      await loadMemberships();
    } catch (error) {
      console.error('Error toggling membership status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Membresías
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Administra las membresías y suscripciones del sistema
          </p>
        </div>
        
        <button 
          onClick={handleCreateMembership}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nueva Membresía</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Card - Total de Membresías */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiCreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Total de Membresías</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-blue-600">{memberships.length}</p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">En el sistema</p>
            </div>
          </div>
        </div>
        
        {/* Card - Membresías Activas */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiCreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Membresías Activas</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-green-600">
                {memberships.filter(m => m.status === true).length}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Disponibles</p>
            </div>
          </div>
        </div>
        
        {/* Card - Membresías Inactivas */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiCreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">Membresías Inactivas</h3>
              <p className="text-xl lg:text-2xl font-cabin-bold text-red-600">
                {memberships.filter(m => m.status === false).length}
              </p>
              <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">Pausadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos - Solo visibles en pantallas grandes */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {/* Gráfico de Progreso Mensual */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-cabin-semibold text-gray-800 flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-amber-600" />
              Progreso Mensual de Inscripciones
            </h3>
          </div>
          <div className="h-64">
            <MembershipChart data={monthlyProgressData} type="line" />
          </div>
        </div>

        {/* Gráfico de Total de Suscriptores */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-cabin-semibold text-gray-800 flex items-center">
              <FiUsers className="w-5 h-5 mr-2 text-amber-600" />
              Total de Suscriptores por Membresía
            </h3>
          </div>
          <div className="h-64">
            <MembershipChart data={subscribersData} type="doughnut" />
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
                placeholder="Buscar membresías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 lg:pl-10 pr-12 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm lg:text-base"
              />
              <button 
                onClick={() => loadMemberships()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Actualizar"
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
      </div>

            {/* Tabla de Membresías */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <span className="text-gray-600 font-cabin-medium">Cargando membresías...</span>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-cabin-semibold text-gray-700 text-sm lg:text-base">
                    Membresía
                  </th>
                  <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-cabin-semibold text-gray-700 text-sm lg:text-base">
                    Precio
                  </th>
                  <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-cabin-semibold text-gray-700 text-sm lg:text-base">
                    Beneficios
                  </th>
                  <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-cabin-semibold text-gray-700 text-sm lg:text-base">
                    Libros
                  </th>
                  <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-cabin-semibold text-gray-700 text-sm lg:text-base">
                    Estado
                  </th>
                  <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-cabin-semibold text-gray-700 text-sm lg:text-base">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberships.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="text-gray-500 font-cabin-medium">
                        {searchTerm ? 'No se encontraron membresías con esa búsqueda' : 'No hay membresías disponibles'}
                      </div>
                      {(searchTerm || (statusFilter.length > 0 && !statusFilter.includes('all'))) && (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="text-amber-600 hover:text-amber-700 font-cabin-medium text-sm"
                            >
                              Limpiar búsqueda
                            </button>
                          )}
                          {statusFilter.length > 0 && !statusFilter.includes('all') && (
                            <button
                              onClick={() => setStatusFilter(['all'])}
                              className="text-amber-600 hover:text-amber-700 font-cabin-medium text-sm"
                            >
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredMemberships.map((membership) => (
                    <tr key={membership.membership_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 lg:py-4 px-3 lg:px-6">
                        <div>
                          <div className="font-cabin-semibold text-gray-800 text-sm lg:text-base">
                            {membership.membership_name}
                          </div>
                          <div className="text-xs lg:text-sm text-gray-600 font-cabin-regular">
                            {membership.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-6">
                        <span className="font-cabin-semibold text-gray-800 text-sm lg:text-base">
                          {formatPrice(membership.price)}
                        </span>
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-6">
                        <div className="max-w-xs">
                          {membership.benefits && membership.benefits.length > 0 ? (
                            <div className="space-y-1">
                              {membership.benefits.slice(0, 2).map((benefit, index) => (
                                <div key={index} className="text-xs text-gray-600 font-cabin-regular truncate">
                                  • {benefit}
                                </div>
                              ))}
                              {membership.benefits.length > 2 && (
                                <div className="text-xs text-amber-600 font-cabin-medium">
                                  +{membership.benefits.length - 2} más
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Sin beneficios</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-6">
                        <span className="font-cabin-semibold text-gray-800 text-sm lg:text-base">
                          {membership.total_products || 0}
                        </span>
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-6">
                        <span className={`inline-flex px-2 lg:px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(membership.status)}`}>
                          {membership.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 lg:py-4 px-3 lg:px-6">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <Link
                            to={`/membresias/detalle/${membership.membership_id}`}
                            className="p-1.5 lg:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver página completa de la membresía"
                          >
                            <FiExternalLink className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </Link>
                          <button 
                            onClick={() => handleViewMembership(membership)}
                            className="p-1.5 lg:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles de la membresía"
                          >
                            <FiEye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditMembership(membership)}
                            className="p-1.5 lg:p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar membresía"
                          >
                            <FiEdit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(membership)}
                            className={`p-1.5 lg:p-2 rounded-lg transition-colors ${
                              membership.status 
                                ? 'text-gray-600 hover:text-red-600 hover:bg-red-50' 
                                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={membership.status ? 'Desactivar membresía' : 'Activar membresía'}
                          >
                            {membership.status ? (
                              <FiXCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            ) : (
                              <FiCheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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