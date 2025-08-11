import React, { useState } from 'react';
import { FiUsers, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import UserInformation from '../components/modals/UserInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Datos simulados de usuarios del sistema
  const users = [
    {
      id: 1,
      name: 'Admin Principal',
      email: 'admin@entrelibros.com',
      role: 'Admin',
      status: 'Activo',
      joinDate: '2023-01-01',
      lastLogin: '2024-01-20',
      avatar: 'AP'
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria.gonzalez@entrelibros.com',
      role: 'Admin',
      status: 'Activo',
      joinDate: '2023-06-15',
      lastLogin: '2024-01-19',
      avatar: 'MG'
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@entrelibros.com',
      role: 'Admin',
      status: 'Activo',
      joinDate: '2023-08-20',
      lastLogin: '2024-01-20',
      avatar: 'CR'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana.martinez@entrelibros.com',
      role: 'Admin',
      status: 'Inactivo',
      joinDate: '2023-03-10',
      lastLogin: '2024-01-05',
      avatar: 'AM'
    },
    {
      id: 5,
      name: 'Luis Pérez',
      email: 'luis.perez@entrelibros.com',
      role: 'Admin',
      status: 'Activo',
      joinDate: '2023-09-01',
      lastLogin: '2024-01-18',
      avatar: 'LP'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Activo' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const handleSaveUser = (userData) => {
    if (modalMode === 'create') {
      // Simular creación de nuevo usuario
      const newUser = {
        id: users.length + 1,
        ...userData,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0],
        avatar: userData.name.split(' ').map(n => n[0]).join('')
      };
      console.log('Nuevo usuario creado:', newUser);
    } else {
      // Simular actualización de usuario
      console.log('Usuario actualizado:', userData);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      // Simular eliminación de usuario
      console.log('Usuario eliminado:', userToDelete);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Usuarios del Sistema
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra el acceso de usuarios a la plataforma
          </p>
        </div>
        
        <button 
          onClick={handleCreateUser}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Nuevo Usuario del Sistema</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card - Usuarios Nuevos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Usuarios Nuevos del Sistema</h3>
              <p className="text-2xl font-cabin-bold text-green-600">47</p>
              <p className="text-sm font-cabin-regular text-gray-500">Esta semana</p>
            </div>
          </div>
        </div>
        
        {/* Card - Usuarios del Mes */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Usuarios del Sistema</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">156</p>
              <p className="text-sm font-cabin-regular text-gray-500">Enero 2024</p>
            </div>
          </div>
        </div>
        
        {/* Card - Usuarios Activos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Usuarios Activos del Sistema</h3>
              <p className="text-2xl font-cabin-bold text-purple-600">1,247</p>
              <p className="text-sm font-cabin-regular text-gray-500">Total activos</p>
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
                placeholder="Buscar usuarios del sistema..."
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
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Usuario del Sistema
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Estado
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Fecha de Registro
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-cabin-semibold text-gray-800">
                      {user.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-regular text-gray-700">
                      {user.email}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-regular text-gray-700">
                      {formatDate(user.joinDate)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

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