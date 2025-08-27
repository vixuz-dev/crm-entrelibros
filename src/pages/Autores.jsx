import React, { useState, useEffect } from 'react';
import { FiUser, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiBook, FiRefreshCw } from 'react-icons/fi';
import CategoryInformation from '../components/modals/CategoryInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import { useAuthorsInformation } from '../store/useAuthorsInformation';

const Autores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState(null);

  const {
    authors,
    currentPage,
    totalPages,
    totalAuthors,
    limit,
    isLoading,
    error,
    loadAuthors,
    refreshAuthors,
    goToPage,
    changeLimit,
    getPaginatedAuthors
  } = useAuthorsInformation();

  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  const getStatusColor = (status) => {
    return status === true 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleViewAuthor = (author) => {
    setSelectedAuthor(author);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCreateAuthor = () => {
    setSelectedAuthor(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditAuthor = (author) => {
    setSelectedAuthor(author);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveAuthor = (authorData) => {
    if (modalMode === 'create') {
      console.log('Nuevo autor creado:', authorData);
    } else {
      console.log('Autor actualizado:', authorData);
    }
    setIsModalOpen(false);
    refreshAuthors();
  };

  const handleDeleteAuthor = (author) => {
    setAuthorToDelete(author);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAuthor = () => {
    if (authorToDelete) {
      console.log('Autor eliminado:', authorToDelete);
    }
    setIsDeleteModalOpen(false);
    setAuthorToDelete(null);
    refreshAuthors();
  };

  const cancelDeleteAuthor = () => {
    setIsDeleteModalOpen(false);
    setAuthorToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAuthor(null);
    setModalMode('view');
  };

  // Filtrar autores basado en el término de búsqueda
  const filteredAuthors = getPaginatedAuthors().filter(author =>
    author.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Autores
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra los autores de libros del sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshAuthors}
            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Actualizar"
          >
            <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={handleCreateAuthor}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Nuevo Autor</span>
          </button>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card - Total de Autores */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total de Autores</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">
                {isLoading ? '...' : totalAuthors}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">En el sistema</p>
            </div>
          </div>
        </div>
        
        {/* Card - Autores Activos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUser className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Autores Activos</h3>
              <p className="text-2xl font-cabin-bold text-green-600">
                {isLoading ? '...' : authors.filter(author => author.status === true).length}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">Disponibles</p>
            </div>
          </div>
        </div>
        
        {/* Card - Autores Inactivos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiUser className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Autores Inactivos</h3>
              <p className="text-2xl font-cabin-bold text-red-600">
                {isLoading ? '...' : authors.filter(author => author.status === false).length}
              </p>
              <p className="text-sm font-cabin-regular text-gray-500">No disponibles</p>
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
                placeholder="Buscar autores por nombre..."
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

      {/* Tabla de Autores */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-cabin-medium">Cargando autores...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-cabin-medium">{error}</p>
            <button
              onClick={refreshAuthors}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="p-8 text-center">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-cabin-medium">
              {searchTerm ? 'No se encontraron autores con ese término' : 'No hay autores disponibles'}
            </p>
          </div>
        ) : (
          <>
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
                  {filteredAuthors.map((author) => (
                    <tr key={author.author_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-cabin-semibold text-gray-800">
                          #{author.author_id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-cabin-semibold text-gray-800">
                          {author.author_name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${getStatusColor(author.status)}`}>
                          {author.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-cabin-regular text-gray-700">
                          {formatDate(author.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewAuthor(author)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditAuthor(author)}
                            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAuthor(author)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
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

            {/* Paginación */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalAuthors}
                itemsPerPage={limit}
                onPageChange={goToPage}
                onItemsPerPageChange={changeLimit}
                itemsPerPageOptions={[5, 8, 12, 16]}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal de Información del Autor */}
      <CategoryInformation 
        category={selectedAuthor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        onSave={handleSaveAuthor}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Autor"
        description={`¿Estás seguro de que quieres eliminar el autor "${authorToDelete?.author_name}"? Esta acción no se puede deshacer.`}
        onCancel={cancelDeleteAuthor}
        onAccept={confirmDeleteAuthor}
        cancelText="Cancelar"
        acceptText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default Autores;
