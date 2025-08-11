import React, { useState } from 'react';
import { FiCreditCard, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiUsers, FiTrendingUp } from 'react-icons/fi';
import MembershipChart from '../components/charts/MembershipChart';
import MembershipInformation from '../components/modals/MembershipInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const Membresias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);

  // Datos simulados de membresías
  const memberships = [
    {
      id: 1,
      title: 'Membresía Básica',
      description: 'Acceso a libros infantiles básicos',
      benefits: ['Acceso a 50 libros', 'Sin anuncios', 'Soporte por email'],
      price: 9.99,
      booksCount: 50,
      selectedBooks: [
        { id: 1, title: 'El Principito', author: 'Antoine de Saint-Exupéry', category: 'Ficción' },
        { id: 2, title: 'Don Quijote', author: 'Miguel de Cervantes', category: 'Clásico' }
      ],
      recurrence: 'Mensual',
      status: 'Activo',
      subscribers: 245
    },
    {
      id: 2,
      title: 'Membresía Premium',
      description: 'Acceso completo a toda la biblioteca',
      benefits: ['Acceso a 500+ libros', 'Sin anuncios', 'Soporte prioritario', 'Contenido exclusivo'],
      price: 19.99,
      booksCount: 500,
      selectedBooks: [
        { id: 3, title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Realismo mágico' },
        { id: 4, title: 'Harry Potter y la piedra filosofal', author: 'J.K. Rowling', category: 'Fantasía' },
        { id: 5, title: 'El Señor de los Anillos', author: 'J.R.R. Tolkien', category: 'Fantasía' }
      ],
      recurrence: 'Mensual',
      status: 'Activo',
      subscribers: 189
    },
    {
      id: 3,
      title: 'Membresía Familiar',
      description: 'Perfecta para familias con múltiples niños',
      benefits: ['Hasta 5 perfiles', 'Acceso completo', 'Contenido educativo', 'Reportes de progreso'],
      price: 29.99,
      booksCount: 500,
      selectedBooks: [
        { id: 6, title: '1984', author: 'George Orwell', category: 'Ciencia ficción' },
        { id: 7, title: 'Orgullo y prejuicio', author: 'Jane Austen', category: 'Romance' }
      ],
      recurrence: 'Mensual',
      status: 'Activo',
      subscribers: 156
    },
    {
      id: 4,
      title: 'Membresía Anual',
      description: 'Ahorra con suscripción anual',
      benefits: ['2 meses gratis', 'Acceso completo', 'Contenido exclusivo', 'Soporte VIP'],
      price: 199.99,
      booksCount: 500,
      selectedBooks: [
        { id: 8, title: 'Los miserables', author: 'Victor Hugo', category: 'Drama' },
        { id: 9, title: 'Crimen y castigo', author: 'Fiódor Dostoyevski', category: 'Drama' },
        { id: 10, title: 'El hobbit', author: 'J.R.R. Tolkien', category: 'Fantasía' }
      ],
      recurrence: 'Anual',
      status: 'Inactivo',
      subscribers: 89
    }
  ];

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
    return status === 'Activo' 
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

  const handleSaveMembership = (membershipData) => {
    if (modalMode === 'create') {
      // Simular creación de nueva membresía
      const newMembership = {
        id: memberships.length + 1,
        ...membershipData,
        booksCount: membershipData.selectedBooks?.length || 0,
        subscribers: 0
      };
      console.log('Nueva membresía creada:', newMembership);
    } else {
      // Simular actualización de membresía
      const updatedMembership = {
        ...membershipData,
        booksCount: membershipData.selectedBooks?.length || 0
      };
      console.log('Membresía actualizada:', updatedMembership);
    }
  };

  const handleDeleteMembership = (membership) => {
    setMembershipToDelete(membership);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMembership = () => {
    if (membershipToDelete) {
      // Simular eliminación de membresía
      console.log('Membresía eliminada:', membershipToDelete);
      // Aquí normalmente harías una llamada a la API para eliminar la membresía
    }
    setIsDeleteModalOpen(false);
    setMembershipToDelete(null);
  };

  const cancelDeleteMembership = () => {
    setIsDeleteModalOpen(false);
    setMembershipToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMembership(null);
    setModalMode('view');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Membresías
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra las membresías y suscripciones del sistema
          </p>
        </div>
        
        <button 
          onClick={handleCreateMembership}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Nueva Membresía</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Card - Total de Membresías */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total de Membresías</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">{memberships.length}</p>
              <p className="text-sm font-cabin-regular text-gray-500">En el sistema</p>
            </div>
          </div>
        </div>
        
        {/* Card - Membresías Activas */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Membresías Activas</h3>
              <p className="text-2xl font-cabin-bold text-green-600">
                {memberships.filter(m => m.status === 'Activo').length}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">Disponibles</p>
            </div>
          </div>
        </div>
        
        {/* Card - Membresías Inactivas */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Membresías Inactivas</h3>
              <p className="text-2xl font-cabin-bold text-red-600">
                {memberships.filter(m => m.status === 'Inactivo').length}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">Pausadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar membresías..."
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
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular">
              <option value="all">Todas las recurrencias</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Membresías */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Membresía
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Precio
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Recurrencia
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Libros
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Suscriptores
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Estado
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => (
                <tr key={membership.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-cabin-semibold text-gray-800">
                        {membership.title}
                      </div>
                      <div className="text-sm text-gray-600 font-cabin-regular">
                        {membership.description}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-semibold text-gray-800">
                      {formatPrice(membership.price)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-regular text-gray-700">
                      {membership.recurrence}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-semibold text-gray-800">
                      {membership.booksCount}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <FiUsers className="w-4 h-4 text-gray-500" />
                      <span className="font-cabin-semibold text-gray-800">
                        {membership.subscribers}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(membership.status)}`}>
                      {membership.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewMembership(membership)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditMembership(membership)}
                        className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMembership(membership)}
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

      {/* Modal de Información de la Membresía */}
      <MembershipInformation 
        membership={selectedMembership}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveMembership}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Membresía"
        description={`¿Estás seguro de que quieres eliminar la membresía "${membershipToDelete?.title}"? Esta acción no se puede deshacer.`}
        onCancel={cancelDeleteMembership}
        onAccept={confirmDeleteMembership}
        cancelText="Cancelar"
        acceptText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default Membresias; 