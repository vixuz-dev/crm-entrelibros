import React, { useState } from 'react';
import { FiBook, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import BooksCard from '../components/books/BooksCard';
import BookInformation from '../components/modals/BookInformation';

const Libros = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Datos simulados de libros con la nueva estructura
  const books = [
    {
      id: 1,
      product_name: "Diego y Beto y las galletas desaparecidas",
      product_description: "Diego y Beto han ido de picnic, y Beto ha preparado una deliciosa sorpresa. Cuando Beto se queda dormido, Diego no puede resistir la tentación de echar un vistazo, ¡y descubre que Beto ha hecho sus galletas favoritas! Diego piensa que no le importará tomarse una, o dos, o incluso tres… Pero, ¿qué pasará cuando Beto despierte? Descubre cómo esta tierna historia sobre la amistad y el perdón hará reír a niños y adultos por igual.",
      product_type: "Digital",
      price: 499.99,
      stock: 20,
      amount_pages: 320,
      discount: 10,
      categories: [1],
      authors: [1],
      topics: [1]
    },
    {
      id: 2,
      product_name: "El Principito",
      product_description: "Una historia poética y filosófica que aborda temas como el amor, la amistad, la soledad y el sentido de la vida. El protagonista, un pequeño príncipe que vive en un asteroide, viaja por diferentes planetas y aprende valiosas lecciones sobre la naturaleza humana.",
      product_type: "Físico",
      price: 299.99,
      stock: 45,
      amount_pages: 96,
      discount: 0,
      categories: [1],
      authors: [2],
      topics: [2],
      cover_image: "https://i.pinimg.com/474x/75/fa/85/75fa852e19641a2046217b538fc144d1.jpg"
    },
    {
      id: 3,
      product_name: "Don Quijote de la Mancha",
      product_description: "La obra maestra de la literatura española que narra las aventuras de Alonso Quijano, un hidalgo que enloquece por la lectura de libros de caballerías y decide convertirse en caballero andante.",
      product_type: "Físico",
      price: 450.00,
      stock: 23,
      amount_pages: 863,
      discount: 15,
      categories: [2],
      authors: [3],
      topics: [3]
    },
    {
      id: 4,
      product_name: "Cien Años de Soledad",
      product_description: "La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo. Una obra maestra del realismo mágico que explora temas como la soledad, el amor y el destino.",
      product_type: "Digital",
      price: 380.50,
      stock: 12,
      amount_pages: 471,
      discount: 0,
      categories: [3],
      authors: [4],
      topics: [4]
    },
    {
      id: 5,
      product_name: "Harry Potter y la Piedra Filosofal",
      product_description: "La primera aventura del joven mago Harry Potter, quien descubre que es un mago y es invitado a asistir a la Escuela de Magia y Hechicería de Hogwarts.",
      product_type: "Físico",
      price: 520.00,
      stock: 0,
      amount_pages: 309,
      discount: 0,
      categories: [1],
      authors: [5],
      topics: [1]
    },
    {
      id: 6,
      product_name: "El Señor de los Anillos",
      product_description: "Una épica historia de fantasía que sigue el viaje de Frodo Bolsón para destruir el Anillo Único y salvar a la Tierra Media de la oscuridad.",
      product_type: "Físico",
      price: 650.00,
      stock: 8,
      amount_pages: 1216,
      discount: 20,
      categories: [4],
      authors: [6],
      topics: [1]
    },
    {
      id: 7,
      product_name: "Matilda",
      product_description: "La historia de Matilda, una niña extraordinariamente inteligente que descubre que tiene poderes telequinéticos y los usa para enfrentar a la cruel directora de su escuela.",
      product_type: "Digital",
      price: 350.00,
      stock: 35,
      amount_pages: 240,
      discount: 0,
      categories: [1],
      authors: [7],
      topics: [5]
    },
    {
      id: 8,
      product_name: "Charlie y la Fábrica de Chocolate",
      product_description: "Charlie Bucket gana un tour por la misteriosa fábrica de chocolate de Willy Wonka, donde vive increíbles aventuras junto a otros niños.",
      product_type: "Físico",
      price: 420.00,
      stock: 18,
      amount_pages: 176,
      discount: 10,
      categories: [1],
      authors: [7],
      topics: [5]
    }
  ];



  const handleViewBook = (book) => {
    console.log('Ver libro:', book);
    // Aquí se abriría un modal con detalles del libro
  };

  const handleEditBook = (book) => {
    console.log('Editar libro:', book);
    // Aquí se abriría un modal de edición
  };

  const handleDeleteBook = (book) => {
    console.log('Eliminar libro:', book);
    // Aquí se mostraría una confirmación de eliminación
  };

  // Objeto para nuevo libro
  const newBook = {
    id: null,
    product_name: '',
    product_description: '',
    product_type: '',
    price: 0,
    stock: 0,
    amount_pages: 0,
    discount: 0,
    categories: [],
    authors: [],
    topics: [],
    cover_image: '',
    additional_images: ['', '', '']
  };

  // Funciones para crear nuevo libro
  const handleCreateBook = () => {
    setShowCreateModal(true);
  };

  const handleSaveNewBook = (bookData) => {
    console.log('Nuevo libro creado:', bookData);
    setShowCreateModal(false);
    // Aquí se haría la llamada al API para crear el libro
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
            Gestión de Libros
          </h1>
          <p className="text-gray-600 font-cabin-regular">
            Administra el catálogo completo de libros infantiles
          </p>
        </div>
        
        <button 
          onClick={handleCreateBook}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Nuevo Libro</span>
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card - Total Libros */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total Libros</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">1,234</p>
              <p className="text-sm font-cabin-regular text-gray-500">En catálogo</p>
            </div>
          </div>
        </div>
        
        {/* Card - Libros Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Disponibles</h3>
              <p className="text-2xl font-cabin-bold text-green-600">1,089</p>
              <p className="text-sm font-cabin-regular text-gray-500">En stock</p>
            </div>
          </div>
        </div>
        
        {/* Card - Libros Agotados */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiBook className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Agotados</h3>
              <p className="text-2xl font-cabin-bold text-red-600">145</p>
              <p className="text-sm font-cabin-regular text-gray-500">Sin stock</p>
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
                placeholder="Buscar libros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-3">
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular">
              <option value="all">Todas las categorías</option>
              <option value="fantasia">Fantasía</option>
              <option value="clasico">Clásico</option>
              <option value="realismo-magico">Realismo Mágico</option>
              <option value="fantasia-epica">Fantasía Épica</option>
            </select>
            
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular">
              <option value="all">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="stock-bajo">Stock Bajo</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Libros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BooksCard
            key={book.id}
            book={book}
            onView={handleViewBook}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />
        ))}
      </div>

      {/* Modal para crear nuevo libro */}
      <BookInformation 
        book={newBook}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEdit={handleSaveNewBook}
        isEditing={true}
      />
    </div>
  );
};

export default Libros; 