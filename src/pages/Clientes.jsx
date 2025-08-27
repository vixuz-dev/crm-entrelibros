import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiUsers, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import ClientInformation from '../components/modals/ClientInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { ROUTES } from '../utils/routes';

const Clientes = () => {
  // Datos simulados de clientes con todos los campos
  const clients = [
    {
      id: 1,
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      phone: '+52 55 1234 5678',
      address: 'Av. Reforma 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06000',
      country: 'México',
      status: 'Activo',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20',
      totalOrders: 12,
      totalSpent: 1250.50,
      notes: 'Cliente frecuente, prefiere envíos express'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+52 55 9876 5432',
      address: 'Calle Juárez 456',
      city: 'Guadalajara',
      state: 'Jalisco',
      zipCode: '44100',
      country: 'México',
      status: 'Activo',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-19',
      totalOrders: 8,
      totalSpent: 890.25,
      notes: 'Cliente VIP, siempre paga con tarjeta'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '+52 55 5555 1234',
      address: 'Plaza Mayor 789',
      city: 'Monterrey',
      state: 'Nuevo León',
      zipCode: '64000',
      country: 'México',
      status: 'Activo',
      joinDate: '2023-12-01',
      lastLogin: '2024-01-20',
      totalOrders: 25,
      totalSpent: 3200.75,
      notes: 'Cliente premium, compra libros educativos'
    },
    {
      id: 4,
      name: 'Luis Pérez',
      email: 'luis.perez@email.com',
      phone: '+52 55 7777 8888',
      address: 'Calle Morelos 321',
      city: 'Puebla',
      state: 'Puebla',
      zipCode: '72000',
      country: 'México',
      status: 'Inactivo',
      joinDate: '2023-11-20',
      lastLogin: '2024-01-05',
      totalOrders: 3,
      totalSpent: 150.00,
      notes: 'Cliente inactivo, último pedido hace 2 meses'
    },
    {
      id: 5,
      name: 'Sofia López',
      email: 'sofia.lopez@email.com',
      phone: '+52 55 9999 1111',
      address: 'Av. Insurgentes 654',
      city: 'Querétaro',
      state: 'Querétaro',
      zipCode: '76000',
      country: 'México',
      status: 'Activo',
      joinDate: '2024-01-05',
      lastLogin: '2024-01-18',
      totalOrders: 15,
      totalSpent: 2100.30,
      notes: 'Cliente activo, prefiere libros de ficción'
    }
  ];

  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Detectar si viene de una acción rápida para crear nuevo cliente
  useEffect(() => {
    if (location.pathname === ROUTES.CUSTOMERS_CREATE) {
      setModalMode('create');
      setIsModalOpen(true);
    }
  }, [location.pathname]);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [clientsList, setClientsList] = useState(clients);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactivo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspendido':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
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
    // Eliminar el cliente de la lista
    setClientsList(prevClients => 
      prevClients.filter(client => client.id !== clientToDelete.id)
    );
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const cancelDeleteClient = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = (clientData) => {
    if (modalMode === 'create') {
      // Crear nuevo cliente
      const newClient = {
        ...clientData,
        id: Math.max(...clientsList.map(c => c.id)) + 1,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setClientsList(prevClients => [...prevClients, newClient]);
    } else if (modalMode === 'edit') {
      // Editar cliente existente
      setClientsList(prevClients => 
        prevClients.map(client => 
          client.id === selectedClient.id ? { ...client, ...clientData } : client
        )
      );
    }
  };

  const filteredClients = clientsList.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra todos los clientes del sistema
          </p>
        </div>
        
        <button 
          onClick={handleCreateClient}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card - Total Clientes */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total Clientes</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">{clientsList.length}</p>
              <p className="text-sm font-cabin-regular text-gray-500">Registrados</p>
            </div>
          </div>
        </div>
        
        {/* Card - Clientes Activos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Clientes Activos</h3>
              <p className="text-2xl font-cabin-bold text-green-600">
                {clientsList.filter(c => c.status === 'Activo').length}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">Actualmente activos</p>
            </div>
          </div>
        </div>
        
        {/* Card - Nuevos este Mes */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Nuevos este Mes</h3>
              <p className="text-2xl font-cabin-bold text-purple-600">3</p>
              <p className="text-sm font-cabin-regular text-gray-500">Enero 2024</p>
            </div>
          </div>
        </div>

        {/* Card - Valor Total */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Valor Total</h3>
              <p className="text-2xl font-cabin-bold text-amber-600">
                {formatPrice(clientsList.reduce((sum, client) => sum + client.totalSpent, 0))}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">En ventas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar clientes por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-3">
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular">
              <option value="all">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="suspendido">Suspendidos</option>
            </select>
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
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-cabin-semibold text-gray-800">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {client.id}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-cabin-regular text-gray-700">
                        {client.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-cabin-regular text-gray-700">
                        {client.city}, {client.state}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.country}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-cabin-regular text-gray-700">
                        {client.totalOrders} pedidos
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(client.totalSpent)}
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
                      <button 
                        onClick={() => handleEditClient(client)}
                        className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        description={`¿Estás seguro de que quieres eliminar al cliente "${clientToDelete?.name}"? Esta acción no se puede deshacer.`}
        acceptText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Clientes; 