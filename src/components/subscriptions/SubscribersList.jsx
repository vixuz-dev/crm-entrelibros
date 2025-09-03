import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard, FiX } from 'react-icons/fi';
import useMembershipsStore from '../../store/useMembershipsStore';
import CustomDropdown from '../ui/CustomDropdown';

const SubscribersList = ({ membership, onClose }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { getSubscriptionsByMembershipId, getActiveSubscriptionsByMembershipId } = useMembershipsStore();

  useEffect(() => {
    loadSubscriptions();
  }, [membership]);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const subs = getSubscriptionsByMembershipId(membership.membership_id);
      setSubscriptions(subs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar suscripciones según búsqueda y estado
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = !searchTerm || 
      subscription.metadata?.contact_information?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.metadata?.contact_information?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.metadata?.contact_information?.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || subscription.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'canceled':
        return 'Cancelada';
      case 'past_due':
        return 'Vencida';
      default:
        return status;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activas' },
    { value: 'canceled', label: 'Canceladas' },
    { value: 'past_due', label: 'Vencidas' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cabin-medium">Cargando suscriptores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <CustomDropdown
            options={statusOptions}
            selectedValues={[filterStatus]}
            onChange={(values) => setFilterStatus(values[0] || 'all')}
            placeholder="Filtrar por estado"
            multiple={false}
            searchable={false}
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-cabin-bold text-blue-600">
            {subscriptions.length}
          </div>
          <div className="text-sm text-blue-700 font-cabin-medium">
            Total Suscriptores
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-cabin-bold text-green-600">
            {subscriptions.filter(s => s.status === 'active').length}
          </div>
          <div className="text-sm text-green-700 font-cabin-medium">
            Suscripciones Activas
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-cabin-bold text-amber-600">
            {subscriptions.filter(s => s.status === 'canceled').length}
          </div>
          <div className="text-sm text-amber-700 font-cabin-medium">
            Suscripciones Canceladas
          </div>
        </div>
      </div>

      {/* Lista de suscriptores */}
      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-cabin-semibold text-gray-600 mb-2">
            No se encontraron suscriptores
          </h3>
          <p className="text-gray-500 font-cabin-regular">
            {searchTerm || filterStatus !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay suscriptores en esta membresía'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubscriptions.map((subscription) => (
            <div key={subscription.subscription_id} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-cabin-semibold text-gray-800">
                        {subscription.metadata?.contact_information?.fullname || 'Usuario sin nombre'}
                      </div>
                      <div className="text-sm text-gray-600 font-cabin-regular">
                        {subscription.metadata?.contact_information?.email || 'Sin email'}
                      </div>
                      {subscription.metadata?.contact_information?.phone && (
                        <div className="text-sm text-gray-600 font-cabin-regular">
                          {subscription.metadata.contact_information.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                      {getStatusText(subscription.status)}
                    </span>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiCreditCard className="w-4 h-4 text-gray-400" />
                        <span>ID: {subscription.subscription_id}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span>Cliente: {subscription.customer_id}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span>Creada: {formatDate(subscription.created)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {subscription.current_period_start && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <span>Inicio: {formatDate(subscription.current_period_start)}</span>
                        </div>
                      )}
                      {subscription.current_period_end && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <span>Fin: {formatDate(subscription.current_period_end)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de dirección si está disponible */}
                  {subscription.metadata?.address_information && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-cabin-semibold text-gray-700 text-sm uppercase tracking-wide mb-2">
                        Dirección de Envío
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-600">
                            <div className="font-cabin-medium">
                              {subscription.metadata.address_information.street} {subscription.metadata.address_information.external_number}
                              {subscription.metadata.address_information.internal_number && ` Int. ${subscription.metadata.address_information.internal_number}`}
                            </div>
                            <div>
                              {subscription.metadata.address_information.neighborhood}, {subscription.metadata.address_information.city}
                            </div>
                            <div>
                              {subscription.metadata.address_information.state} {subscription.metadata.address_information.postal_code}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscribersList;
