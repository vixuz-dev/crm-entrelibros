import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUsers, 
  FiCreditCard, 
  FiCalendar, 
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
  FiPhone,
  FiMail,
  FiMapPin
} from 'react-icons/fi';
import useMembershipsStore from '../store/useMembershipsStore';
import { showError } from '../utils/notifications';
import { ROUTES } from '../utils/routes';

const DetalleMembresia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [membership, setMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});

  // Store de membresías (ahora incluye suscripciones)
  const { 
    memberships, 
    isInitialized, 
    loadMemberships,
    refreshSubscriptions
  } = useMembershipsStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    if (isInitialized) {
      loadMembershipData();
    } else {
      loadMemberships();
    }
  }, [isInitialized, id]);

  // Recargar datos cuando cambien las membresías
  useEffect(() => {
    if (memberships.length > 0) {
      const foundMembership = memberships.find(m => m.membership_id == id);
      if (foundMembership) {
        setMembership(foundMembership);
      }
    }
  }, [memberships, id]);

  const loadMembershipData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar membresías si no están inicializadas
      if (!isInitialized) {
        await loadMemberships();
      }
      
      // Buscar la membresía específica
      const foundMembership = memberships.find(m => m.membership_id == id);
      
      if (!foundMembership) {
        showError('Membresía no encontrada');
        navigate(ROUTES.MEMBRESIAS);
        return;
      }
      
      // Si no tiene suscripciones, intentar refrescarlas
      if (!foundMembership.subscriptions || foundMembership.subscriptions.length === 0) {
        await refreshSubscriptions();
      }
      
      // Buscar la membresía actualizada
      const updatedMembership = memberships.find(m => m.membership_id == id);
      if (updatedMembership) {
        setMembership(updatedMembership);
      } else {
        setMembership(foundMembership);
      }
      
    } catch (error) {
      console.error('Error loading membership data:', error);
      showError('Error al cargar los datos de la membresía');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(ROUTES.MEMBRESIAS);
  };

  // Funciones de utilidad
  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const getStatusColor = (status) => {
    return status ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusText = (status) => {
    return status ? 'Activo' : 'Inactivo';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cabin-regular">Cargando membresía...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-cabin-bold mb-4">Membresía no encontrada</div>
          <button
            onClick={handleGoBack}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Volver a Membresías
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-cabin-bold text-gray-800">
                  {membership.membership_name}
                </h1>
                <p className="text-gray-600 font-cabin-regular">
                  Detalles de la membresía
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(membership.status)}`}>
                {getStatusText(membership.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Información principal */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información básica */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
                      {membership.membership_name}
                    </h2>
                    <p className="text-gray-600 font-cabin-regular leading-relaxed">
                      {membership.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-cabin-bold text-gray-800">
                        {formatPrice(membership.price)}
                      </span>
                      <span className="text-gray-600 font-cabin-regular">/mes</span>
                    </div>
                  </div>
                  
                  {/* Beneficios */}
                  <div>
                    <button
                      onClick={() => setShowBenefits(!showBenefits)}
                      className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-cabin-medium transition-colors"
                    >
                      <FiPackage className="w-5 h-5" />
                      <span>Ver Beneficios</span>
                    </button>
                    
                    {showBenefits && membership.benefits && membership.benefits.length > 0 && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg animate-in slide-in-from-top-2 duration-200">
                        <ul className="space-y-2">
                          {membership.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-amber-600 mt-1">•</span>
                              <span className="text-gray-700 font-cabin-regular">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {showBenefits && (!membership.benefits || membership.benefits.length === 0) && (
                      <div className="p-4 bg-gray-50 rounded-lg text-center animate-in slide-in-from-top-2 duration-200">
                        <p className="text-gray-500 font-cabin-regular">Sin beneficios definidos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas y métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
                {membership.subscriptions?.length || 0}
              </div>
              <div className="text-sm text-gray-600 font-cabin-regular">
                Total Suscriptores
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUsers className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
                {membership.subscriptions?.filter(s => s.status === 'active').length || 0}
              </div>
              <div className="text-sm text-gray-600 font-cabin-regular">
                Suscripciones Activas
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiDollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
                {formatPrice(membership.price)}
              </div>
              <div className="text-sm text-gray-600 font-cabin-regular">
                Precio por Mes
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-cabin-bold text-gray-800 mb-1">
                {formatPrice((membership.subscriptions?.filter(s => s.status === 'active').length || 0) * (membership.price || 0))}
              </div>
              <div className="text-sm text-gray-600 font-cabin-regular">
                Ingresos Mensuales
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-cabin-semibold text-gray-800">
                Información Adicional
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiCreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-cabin-medium text-gray-600">ID de Membresía</div>
                      <div className="font-cabin-semibold text-gray-800">#{membership.membership_id}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-cabin-medium text-gray-600">Fecha de Creación</div>
                      <div className="font-cabin-semibold text-gray-800">
                        {membership.created_at ? new Date(membership.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {membership.stripe_product_id && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-cabin-medium text-gray-600">Stripe Product ID</div>
                        <div className="font-cabin-semibold text-gray-800 font-mono text-sm">
                          {membership.stripe_product_id}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {membership.stripe_price_id && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-cabin-medium text-gray-600">Stripe Price ID</label>
                      <p className="font-cabin-regular text-gray-700 text-sm font-mono">
                        {membership.stripe_price_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        
        {/* Sección de Usuarios Suscritos - Expandible */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-10">
          <button
            onClick={() => setShowSubscribers(!showSubscribers)}
            className="w-full px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-cabin-semibold text-gray-800">
                    Usuarios Suscritos
                  </h3>
                  <p className="text-sm text-gray-600 font-cabin-regular">
                    Listado informativo de usuarios activos en esta membresía
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl font-cabin-bold text-green-600">
                    {membership.subscriptions?.length || 0}
                  </div>
                  <div className="text-sm text-500 font-cabin-regular">
                    Suscriptores
                  </div>
                </div>
                <div className={`transform transition-transform duration-200 ${showSubscribers ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
          
          {showSubscribers && (
            <div className="p-6 animate-in slide-in-from-top-2 duration-200">
              {membership.subscriptions && membership.subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {/* Resumen de estadísticas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-cabin-bold text-blue-600">
                        {membership.subscriptions.length}
                      </div>
                      <div className="text-sm text-blue-700 font-cabin-medium">
                        Total Suscriptores
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-cabin-bold text-green-600">
                        {membership.subscriptions.filter(s => s.status === 'active').length}
                      </div>
                      <div className="text-sm text-green-700 font-cabin-medium">
                        Suscripciones Activas
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-cabin-bold text-amber-600">
                        {formatPrice((membership.subscriptions.filter(s => s.status === 'active').length || 0) * (membership.price || 0))}
                      </div>
                      <div className="text-sm text-amber-700 font-cabin-medium">
                        Ingresos Mensuales
                      </div>
                    </div>
                  </div>

                  {/* Lista de usuarios */}
                  <div className="space-y-3">
                    {membership.subscriptions.map((subscription, index) => (
                      <div key={subscription.subscription_id} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                        {/* Header del card - Siempre visible */}
                        <button
                          onClick={() => {
                            const newExpandedUsers = { ...expandedUsers };
                            newExpandedUsers[subscription.subscription_id] = !newExpandedUsers[subscription.subscription_id];
                            setExpandedUsers(newExpandedUsers);
                          }}
                          className="w-full p-4 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiUsers className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-cabin-semibold text-gray-800">
                                  {subscription.metadata?.contact_information?.fullname || 'Usuario sin nombre'}
                                </div>
                                <div className="text-sm text-gray-600 font-cabin-regular">
                                  {subscription.metadata?.contact_information?.email || 'Sin email'}
                                </div>
                                <div className="text-xs text-gray-500 font-cabin-regular">
                                  ID: {subscription.metadata?.user_id || 'N/A'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  subscription.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {subscription.status === 'active' ? 'Activa' : 'Inactiva'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {subscription.current_period_end ? 
                                    new Date(subscription.current_period_end).toLocaleDateString('es-ES') : 
                                    'Sin fecha de fin'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Contenido expandible */}
                        {expandedUsers[subscription.subscription_id] && (
                          <div className="border-t border-gray-100 p-4 bg-gray-50 animate-in slide-in-from-top-2 duration-200">
                            <div className="space-y-4">
                              {/* Información de contacto */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h4 className="font-cabin-semibold text-gray-700 text-sm uppercase tracking-wide">
                                    Información de Contacto
                                  </h4>
                                  
                                  {subscription.metadata?.contact_information?.phone && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <FiPhone className="w-4 h-4 text-gray-400" />
                                      <span>{subscription.metadata.contact_information.phone}</span>
                                    </div>
                                  )}
                                  
                                  {subscription.metadata?.contact_information?.email && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <FiMail className="w-4 h-4 text-gray-400" />
                                      <span>{subscription.metadata.contact_information.email}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Información de suscripción */}
                                <div className="space-y-3">
                                  <h4 className="font-cabin-semibold text-gray-700 text-sm uppercase tracking-wide">
                                    Detalles de Suscripción
                                  </h4>
                                  
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <div className="w-4 h-4 text-gray-400">🆔</div>
                                    <span>ID: {subscription.subscription_id}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <div className="w-4 h-4 text-gray-400">👤</div>
                                    <span>Cliente: {subscription.customer_id}</span>
                                  </div>
                                  
                                  {subscription.current_period_start && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <FiCalendar className="w-4 h-4 text-gray-400" />
                                      <span>Inicio: {new Date(subscription.current_period_start).toLocaleDateString('es-ES')}</span>
                                    </div>
                                  )}
                                  
                                  {subscription.current_period_end && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <FiCalendar className="w-4 h-4 text-gray-400" />
                                      <span>Fin: {new Date(subscription.current_period_end).toLocaleDateString('es-ES')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Información de dirección */}
                              {subscription.metadata?.address_information && (
                                <div className="border-t border-gray-200 pt-4">
                                  <h4 className="font-cabin-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">
                                    Dirección de Envío
                                  </h4>
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-cabin-semibold text-gray-600 mb-2">
                    {membership.subscriptions ? 'No hay suscriptores' : 'Cargando suscriptores...'}
                  </h3>
                  <p className="text-gray-500 font-cabin-regular">
                    {membership.subscriptions 
                      ? 'Esta membresía aún no tiene usuarios registrados. Los suscriptores aparecerán aquí cuando se registren.'
                      : 'Obteniendo información de suscriptores...'
                    }
                  </p>
                  {!membership.subscriptions && (
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleMembresia;
