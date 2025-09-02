import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCreditCard, FiX } from 'react-icons/fi';
import useSubscriptionsStore from '../../store/useSubscriptionsStore';
import CustomDropdown from '../ui/CustomDropdown';

const SubscribersList = ({ membership, onClose }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { getSubscriptionsByMembershipId, getActiveSubscriptionsByMembershipId } = useSubscriptionsStore();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cabin-regular">Cargando suscriptores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-cabin-bold text-gray-800">
              {subscriptions.length}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Total Suscriptores
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-cabin-bold text-green-600">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Suscripciones Activas
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-cabin-bold text-amber-600">
              ${membership.price}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Precio por Mes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-cabin-bold text-blue-600">
              ${(subscriptions.filter(s => s.status === 'active').length * membership.price).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 font-cabin-regular">
              Ingresos Mensuales
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <FiUser className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="sm:w-48">
          <CustomDropdown
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Solo activas' },
              { value: 'canceled', label: 'Solo canceladas' },
              { value: 'past_due', label: 'Solo vencidas' }
            ]}
            selectedValues={[filterStatus]}
            onChange={(values) => setFilterStatus(values[0])}
            placeholder="Filtrar por estado"
            multiple={false}
            searchable={false}
            className="w-full"
          />
        </div>
      </div>

      {/* Lista de suscriptores */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 font-cabin-medium">
              {searchTerm || filterStatus !== 'all' 
                ? 'No se encontraron suscriptores con los filtros aplicados' 
                : 'No hay suscriptores para esta membresía'
              }
            </div>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="mt-2 text-green-600 hover:text-green-700 font-cabin-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
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
                    Dirección
                  </th>
                  <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                    Fechas
                  </th>
                  <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                    ID Stripe
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription, index) => (
                  <tr key={subscription.subscription_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-cabin-semibold text-gray-800">
                            {subscription.metadata?.contact_information?.fullname || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-600 font-cabin-regular">
                            ID: {subscription.metadata?.user_id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-800">
                            {subscription.metadata?.contact_information?.email || 'Sin email'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-800">
                            {subscription.metadata?.contact_information?.phone || 'Sin teléfono'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-xs">
                        {subscription.metadata?.address_information ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <FiMapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-800 truncate">
                                {subscription.metadata.address_information.street} {subscription.metadata.address_information.external_number}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {subscription.metadata.address_information.neighborhood}, {subscription.metadata.address_information.city}
                            </div>
                            <div className="text-xs text-gray-600">
                              {subscription.metadata.address_information.state} {subscription.metadata.address_information.postal_code}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Sin dirección</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(subscription.status)}`}>
                        {getStatusText(subscription.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Creada:</span>
                          <div className="text-gray-800 font-cabin-medium">
                            {formatDate(subscription.created)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Válida hasta:</span>
                          <div className="text-gray-800 font-cabin-medium">
                            {formatDate(subscription.current_period_end)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs">
                        <div className="font-mono text-gray-600">
                          {subscription.subscription_id}
                        </div>
                        <div className="font-mono text-gray-500">
                          {subscription.customer_id}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribersList;
