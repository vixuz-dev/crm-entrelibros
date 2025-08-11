import React, { useState } from 'react';
import { FiGrid, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiBook } from 'react-icons/fi';
import CategoryInformation from '../components/modals/CategoryInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const Categorias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Datos simulados de categorías
  const categories = [
    {
      id: 1,
      name: 'Fantasía',
      description: 'Libros de fantasía y mundos mágicos para niños',
      icon: '🧙‍♂️',
      status: 'Activo',
      booksCount: 45
    },
    {
      id: 2,
      name: 'Aventura',
      description: 'Historias de aventuras y exploración',
      icon: '🗺️',
      status: 'Activo',
      booksCount: 32
    },
    {
      id: 3,
      name: 'Educativo',
      description: 'Libros educativos y de aprendizaje',
      icon: '📚',
      status: 'Activo',
      booksCount: 28
    },
    {
      id: 4,
      name: 'Ciencia Ficción',
      description: 'Ciencia ficción adaptada para niños',
      icon: '🚀',
      status: 'Inactivo',
      booksCount: 15
    },
    {
      id: 5,
      name: 'Misterio',
      description: 'Libros de misterio y detectives infantiles',
      icon: '🔍',
      status: 'Activo',
      booksCount: 22
    },
    {
      id: 6,
      name: 'Animales',
      description: 'Historias protagonizadas por animales',
      icon: '🐾',
      status: 'Activo',
      booksCount: 38
    },
    {
      id: 7,
      name: 'Familiar',
      description: 'Libros sobre familia y relaciones',
      icon: '👨‍👩‍👧‍👦',
      status: 'Activo',
      booksCount: 25
    },
    {
      id: 8,
      name: 'Deportes',
      description: 'Libros sobre deportes y actividad física',
      icon: '⚽',
      status: 'Inactivo',
      booksCount: 12
    },
    {
      id: 9,
      name: 'Arte y Música',
      description: 'Libros sobre arte, música y creatividad',
      icon: '🎨',
      status: 'Activo',
      booksCount: 18
    },
    {
      id: 10,
      name: 'Naturaleza',
      description: 'Libros sobre naturaleza y medio ambiente',
      icon: '🌿',
      status: 'Activo',
      booksCount: 30
    }
  ];

  const getStatusColor = (status) => {
    return status === 'Activo' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (categoryData) => {
    if (modalMode === 'create') {
      // Simular creación de nueva categoría
      const newCategory = {
        id: categories.length + 1,
        ...categoryData,
        booksCount: 0
      };
      console.log('Nueva categoría creada:', newCategory);
    } else {
      // Simular actualización de categoría
      console.log('Categoría actualizada:', categoryData);
    }
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      // Simular eliminación de categoría
      console.log('Categoría eliminada:', categoryToDelete);
      // Aquí normalmente harías una llamada a la API para eliminar la categoría
    }
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const cancelDeleteCategory = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setModalMode('view');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra las categorías de libros del sistema
          </p>
        </div>
        
        <button 
          onClick={handleCreateCategory}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card - Total de Categorías */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiGrid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total de Categorías</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">10</p>
              <p className="text-sm font-cabin-regular text-gray-500">En el sistema</p>
            </div>
          </div>
        </div>
        
        {/* Card - Categorías Activas */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiGrid className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Categorías Activas</h3>
              <p className="text-2xl font-cabin-bold text-green-600">8</p>
              <p className="text-sm font-cabin-regular text-gray-500">Disponibles</p>
            </div>
          </div>
        </div>
        
        {/* Card - Total de Libros */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total de Libros</h3>
              <p className="text-2xl font-cabin-bold text-purple-600">265</p>
              <p className="text-sm font-cabin-regular text-gray-500">Categorizados</p>
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
                placeholder="Buscar categorías..."
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
          </div>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  ID
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Nombre
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Descripción
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Icono
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Estado
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Libros Relacionados
                </th>
                <th className="text-left py-4 px-6 font-cabin-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-cabin-semibold text-gray-800">
                      #{category.id}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-cabin-semibold text-gray-800">
                      {category.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-cabin-regular text-gray-700">
                      {category.description}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-2xl">
                      {category.icon}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(category.status)}`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <FiBook className="w-4 h-4 text-gray-500" />
                      <span className="font-cabin-semibold text-gray-800">
                        {category.booksCount}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewCategory(category)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category)}
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

      {/* Modal de Información de la Categoría */}
      <CategoryInformation 
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveCategory}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Categoría"
        description={`¿Estás seguro de que quieres eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        onCancel={cancelDeleteCategory}
        onAccept={confirmDeleteCategory}
        cancelText="Cancelar"
        acceptText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default Categorias; 