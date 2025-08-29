import React, { useState, useEffect } from 'react';
import { FiBook, FiEye, FiEdit, FiTrash2, FiTag, FiX } from 'react-icons/fi';
import BookInformation from '../modals/BookInformation';
import ConfirmationModal from '../modals/ConfirmationModal';

const BooksCard = ({ book, onView, onEdit, onDelete }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showBookInfo, setShowBookInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Función para cerrar el modal
  const closeModal = () => {
    setShowImageModal(false);
  };

  // Funciones para el modal de confirmación de eliminación
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    
  };

  const handleDeleteAccept = () => {
    setShowDeleteModal(false);
    
    // Aquí se llamará a onDelete cuando esté implementado
    onDelete(book);
  };

  // Event listener para la tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        closeModal();
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  // Función para obtener una imagen de portada aleatoria
  const getRandomCoverImage = () => {
    const coverImages = [
      "https://i.pinimg.com/474x/75/fa/85/75fa852e19641a2046217b538fc144d1.jpg",
      "https://marketplace.canva.com/EAFAga34FsI/1/0/1003w/canva-portada-para-libro-infantil-sencillo-kawaii-g8D86FTIvEQ.jpg",
      "https://marketplace.canva.com/EAFJnWURIPg/1/0/501w/canva-portada-para-libro-infantil-ilustrado-amarillo-LegMV6JLkZI.jpg",
      "https://cdn.venngage.com/template/thumbnail/310/ca7842cf-5632-410b-a66e-57845c44b17e.webp",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVIqnmcVgn2_zEBVlg5LmkoDOqqekngaNkHw&s"
    ];
    return coverImages[Math.floor(Math.random() * coverImages.length)];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const calculateDiscountedPrice = (originalPrice, discount) => {
    if (!discount || discount === 0) return originalPrice;
    return originalPrice - (originalPrice * discount / 100);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Agotado', color: 'bg-red-100 text-red-800 border-red-200' };
    if (stock <= 5) return { text: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { text: 'Disponible', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const stockStatus = getStockStatus(book.stock);
  const discountedPrice = calculateDiscountedPrice(book.price, book.discount);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
        {/* Imagen del libro */}
        <div className="relative h-64 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
          <div className="w-28 h-36 bg-amber-600 rounded-md shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => setShowImageModal(true)}>
            <img 
              src={book.cover_image || getRandomCoverImage()} 
              alt={book.product_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-amber-600 flex items-center justify-center" style={{display: 'none'}}>
              <FiBook className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* Badge de descuento */}
          {book.discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-cabin-bold px-2 py-1 rounded-full">
              -{book.discount}%
            </div>
          )}
          
          {/* Badge de tipo */}
          <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-cabin-medium px-2 py-1 rounded-full">
            {book.product_type}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Contenido principal */}
          <div className="flex-grow">
            {/* Título */}
            <h3 className="font-cabin-semibold text-gray-800 text-base leading-tight mb-3 line-clamp-2">
              {book.product_name}
            </h3>

            {/* Estado del stock y Precios en la misma línea */}
            <div className="flex items-center justify-between mb-4">
              {/* Precios */}
              <div>
                {book.discount > 0 ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-cabin-bold text-gray-800">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="text-sm font-cabin-regular text-gray-500 line-through">
                      {formatPrice(book.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-cabin-bold text-gray-800">
                    {formatPrice(book.price)}
                  </span>
                )}
              </div>

              {/* Estado del stock */}
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-cabin-medium border ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>
          </div>

          {/* Acciones - siempre al final */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <button
              onClick={() => setShowBookInfo(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Editar"
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de imagen en pantalla completa */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <FiX className="w-6 h-6" />
            </button>
            <img 
              src={book.cover_image || getRandomCoverImage()} 
              alt={book.product_name}
              className="w-full h-full max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

          </div>
        </div>
      )}

      {/* Modal de información del libro - Modo lectura */}
      <BookInformation 
        book={book}
        isOpen={showBookInfo}
        onClose={() => setShowBookInfo(false)}
        onEdit={onEdit}
      />

      {/* Modal de información del libro - Modo edición */}
      <BookInformation 
        book={book}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={(updatedBook) => {
          onEdit(updatedBook);
          setShowEditModal(false);
        }}
        isEditing={true}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="¿Deseas remover este libro?"
        description="Lo puedes volver a habilitar si lo necesitas"
        onCancel={handleDeleteCancel}
        onAccept={handleDeleteAccept}
        cancelText="Cancelar"
        acceptText="Eliminar"
        type="danger"
      />
    </>
  );
};

export default BooksCard; 