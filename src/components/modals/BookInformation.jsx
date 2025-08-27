import React, { useState, useEffect } from "react";
import {
  FiX,
  FiBook,
  FiUser,
  FiTag,
  FiDollarSign,
  FiPackage,
  FiFileText,
  FiCalendar,
  FiHash,
  FiEdit,
  FiSave,
  FiRotateCcw,
  FiUpload,
} from "react-icons/fi";
import CustomDropdown from "../ui/CustomDropdown";
import placeholderImage from "../../assets/images/placeholder.jpg";

const BookInformation = ({
  book,
  isOpen,
  onClose,
  mode = "view",
  onSave,
  isLoadingDetail = false,
}) => {
  const [editData, setEditData] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Mapeo de categorías de libros infantiles
  const categoryMap = {
    1: "Fantasía",
    2: "Aventura",
    3: "Educativo",
    4: "Ilustrado",
    5: "Interactivo",
    6: "Clásicos",
    7: "Ciencia",
    8: "Historia",
    9: "Arte",
    10: "Música",
  };

  // Mapeo de temas de libros infantiles
  const topicMap = {
    1: "Amistad",
    2: "Familia",
    3: "Naturaleza",
    4: "Animales",
    5: "Colores",
    6: "Números",
    7: "Letras",
    8: "Emociones",
    9: "Valores",
    10: "Creatividad",
  };

  // Mapeo de autores
  const authorMap = {
    1: "Chris Naylor-Ballesteros",
    2: "Antoine de Saint-Exupéry",
    3: "Miguel de Cervantes",
    4: "Gabriel García Márquez",
    5: "Dr. Seuss",
    6: "Eric Carle",
    7: "Maurice Sendak",
    8: "Beatrix Potter",
    9: "Lewis Carroll",
    10: "J.K. Rowling",
  };

  // Convertir mapas a opciones para dropdowns
  const authorOptions = Object.entries(authorMap).map(([id, name]) => ({
    value: parseInt(id),
    label: name,
  }));

  // Opciones para tipo de producto
  const productTypeOptions = [
    { value: "Físico", label: "Físico" },
    { value: "Digital", label: "Digital" },
    { value: "Audiobook", label: "Audiobook" },
  ];

  // Opciones para categorías
  const categoryOptions = Object.entries(categoryMap).map(([id, name]) => ({
    value: parseInt(id),
    label: name,
  }));

  // Opciones para temas
  const topicOptions = Object.entries(topicMap).map(([id, name]) => ({
    value: parseInt(id),
    label: name,
  }));

  // Inicializar datos de edición cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setEditData({
        product_name: book?.product_name || "",
        product_description: book?.product_description || "",
        product_type: book?.product_type || "",
        price: book?.price || 0,
        price_offer: book?.price_offer || 0,
        discount: book?.discount || 0,
        status: book?.status || 1,
        main_image_url: book?.main_image_url || "",
        category_list: book?.category_list || [],
        topic_list: book?.topic_list || [],
        author_list: book?.author_list || [],
      });
      setIsEditMode(mode === "create" || mode === "edit");
    }
  }, [isOpen, book, mode]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  const calculateDiscountedPrice = (originalPrice, discount) => {
    if (!discount || discount === 0) return originalPrice;
    return originalPrice - (originalPrice * discount) / 100;
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        text: "Agotado",
        color: "bg-red-100 text-red-800 border-red-200",
      };
    if (stock <= 5)
      return {
        text: "Stock Bajo",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    return {
      text: "Disponible",
      color: "bg-green-100 text-green-800 border-green-200",
    };
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Funciones para drag and drop - Imagen principal
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange("main_image_url", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Funciones para drag and drop - Imágenes adicionales
  const handleAdditionalFileSelect = (file, index) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedImages = [...(editData.additional_images || ["", "", ""])];
        updatedImages[index] = event.target.result;
        setEditData((prev) => ({ ...prev, additional_images: updatedImages }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleAdditionalDrop = (e, index) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleAdditionalFileSelect(file, index);
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(editData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Error al guardar el libro. Por favor intenta de nuevo.");
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      onClose();
    } else {
      setIsEditMode(false);
      // Restaurar datos originales
      if (book) {
        setEditData({
          product_name: book.product_name || "",
          product_description: book.product_description || "",
          product_type: book.product_type || "",
          price: book.price || 0,
          price_offer: book.price_offer || 0,
          discount: book.discount || 0,
          status: book.status || 1,
          main_image_url: book.main_image_url || "",
          category_list: book.category_list || [],
          topic_list: book.topic_list || [],
          author_list: book.author_list || [],
        });
      }
    }
  };

  const getModalTitle = () => {
    if (mode === "create") return "Crear Nuevo Libro";
    if (isEditMode) return "Editar Libro";
    return "Información del Libro";
  };

  const getModalSubtitle = () => {
    if (mode === "create") return "Agregar un nuevo libro al catálogo";
    if (isEditMode)
      return `Editando información de ${book?.product_name || "libro"}`;
    return `Detalles completos de ${book?.product_name || "libro"}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            {/* Avatar del libro */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiBook className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-cabin-bold text-gray-800 truncate">
                {getModalTitle()}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {getModalSubtitle()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {!isEditMode && mode !== "create" && (
              <button
                onClick={() => setIsEditMode(true)}
                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Editar"
              >
                <FiEdit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-cabin-medium">
                  Cargando detalles del producto...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Información básica */}
              <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-6">
                {/* Sección de imágenes */}
                <div className="w-full md:w-1/3 flex flex-col justify-center items-center">
                  {/* Imagen principal */}
                  <div className="w-full max-w-xs mb-4">
                    {/* Imágenes secundarias */}
                    {!isEditMode &&
                      book.secondary_url_image_list &&
                      book.secondary_url_image_list.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-cabin-medium text-gray-600 mb-2">
                            Imágenes adicionales:
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {book.secondary_url_image_list.map(
                              (imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`Imagen adicional ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-lg shadow-sm"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {isEditMode ? (
                      <div
                        className={`relative w-full transition-all duration-200 ${
                          isDragging ? "opacity-80" : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {editData.main_image_url || book.main_image_url ? (
                          <>
                            <img
                              src={
                                editData.main_image_url || book.main_image_url
                              }
                              alt={`Portada de ${book.product_name}`}
                              className={`w-full h-auto rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity ${
                                isDragging
                                  ? "border-2 border-dashed border-amber-500"
                                  : "border-2 border-dashed border-amber-300"
                              }`}
                            />

                            {/* Overlay de edición */}
                            <div
                              className={`absolute inset-0 transition-all duration-200 flex items-center justify-center rounded-lg ${
                                isDragging
                                  ? "bg-amber-500 bg-opacity-80"
                                  : "bg-black bg-opacity-0 hover:bg-opacity-40"
                              }`}
                            >
                              <div
                                className={`text-white text-center transition-opacity duration-200 ${
                                  isDragging
                                    ? "opacity-100"
                                    : "opacity-0 hover:opacity-100"
                                }`}
                              >
                                <FiUpload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                                <span className="text-xs sm:text-sm font-cabin-medium">
                                  {isDragging
                                    ? "Suelta la imagen aquí"
                                    : "Cambiar imagen"}
                                </span>
                                {!isDragging && (
                                  <div className="text-xs mt-1 opacity-80 hidden sm:block">
                                    Arrastra o haz clic
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Placeholder para nuevo libro */
                          <div
                            className={`w-full aspect-[3/4] rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 flex items-center justify-center ${
                              isDragging
                                ? "border-amber-500 bg-amber-50"
                                : "border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                            }`}
                          >
                            <div className="text-center p-6">
                              <FiUpload
                                className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                                  isDragging
                                    ? "text-amber-600"
                                    : "text-gray-400 group-hover:text-amber-500"
                                }`}
                              />
                              <p className="text-sm font-cabin-medium text-gray-600 mb-1">
                                {isDragging
                                  ? "Suelta la imagen aquí"
                                  : "Subir imagen principal"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Arrastra una imagen o haz clic para seleccionar
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Input file oculto */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            handleFileSelect(file);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <img
                        src={book.main_image_url || placeholderImage}
                        alt={`Portada de ${book.product_name}`}
                        className="w-full h-auto rounded-lg object-cover shadow-lg"
                        onError={(e) => {
                          e.target.src = placeholderImage;
                        }}
                      />
                    )}
                  </div>

                  {/* Cuadrícula de imágenes adicionales - Solo en modo edición */}
                  {isEditMode && (
                    <div className="w-full max-w-xs">
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-400 transition-colors cursor-pointer group"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleAdditionalDrop(e, index)}
                          >
                            {editData.additional_images?.[index] ? (
                              <img
                                src={editData.additional_images[index]}
                                alt={`Imagen adicional ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-amber-500 transition-colors">
                                <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                            )}

                            {/* Overlay para cambio de imagen */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiUpload className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                                <span className="text-xs font-cabin-medium">
                                  {editData.additional_images?.[index]
                                    ? "Cambiar"
                                    : "Subir"}
                                </span>
                              </div>
                            </div>

                            {/* Input file oculto */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                handleAdditionalFileSelect(file, index);
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mostrar imágenes adicionales en modo lectura */}
                  {!isEditMode &&
                    book.additional_images &&
                    book.additional_images.some((img) => img) && (
                      <div className="w-full max-w-xs mt-4">
                        <div className="grid grid-cols-3 gap-2">
                          {book.additional_images.map(
                            (image, index) =>
                              image && (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Imagen adicional ${index + 1}`}
                                  className="w-full aspect-square object-cover rounded-lg"
                                />
                              )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Leyenda de formatos - Justo debajo de las imágenes */}
                  {isEditMode && (
                    <div className="mt-3 text-xs text-gray-500 text-center">
                      <div>Formatos: PNG, JPEG, JPG Webp</div>
                      <div>Menor a 5MB</div>
                    </div>
                  )}
                </div>

                {/* Información principal */}
                <div className="flex-1 space-y-3 sm:space-y-4 w-full lg:w-auto">
                  {/* Título y Tipo */}
                  <div>
                    {isEditMode ? (
                      <div>
                        <input
                          type="text"
                          value={editData.product_name}
                          onChange={(e) =>
                            handleInputChange("product_name", e.target.value)
                          }
                          className="w-full text-2xl font-cabin-bold text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
                          placeholder="Título del libro"
                        />
                        <div>
                          <span className="font-cabin-medium text-gray-600 block text-sm mb-1">
                            Tipo de producto:
                          </span>
                          <CustomDropdown
                            options={productTypeOptions}
                            selectedValues={
                              editData.product_type
                                ? [editData.product_type]
                                : []
                            }
                            onChange={(values) =>
                              handleInputChange("product_type", values[0] || "")
                            }
                            placeholder="Seleccionar tipo..."
                            multiple={false}
                            searchable={false}
                            className="w-full max-w-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-cabin-bold text-gray-800">
                          {book.product_name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-cabin-medium border ${stockStatus.color}`}>
                          <FiPackage className="w-4 h-4 mr-1" />
                          {stockStatus.text}
                        </span> */}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-cabin-medium bg-blue-100 text-blue-800">
                            <FiFileText className="w-4 h-4 mr-1" />
                            {book.product_type}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Autores */}
                  <div>
                    {isEditMode ? (
                      <div>
                        <span className="font-cabin-medium text-gray-600 block text-sm mb-1">
                          Autores:
                        </span>
                        <CustomDropdown
                          options={authorOptions}
                          selectedValues={
                            editData.author_list?.map(
                              (author) => author.author_id
                            ) || []
                          }
                          onChange={(values) =>
                            setEditData((prev) => ({
                              ...prev,
                              author_list: values.map((id) => ({
                                author_id: id,
                                author_name: authorMap[id] || `Autor ${id}`,
                              })),
                            }))
                          }
                          placeholder="Seleccionar autores..."
                          multiple={true}
                          searchable={true}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="font-cabin-medium text-gray-600 block text-sm">
                          Autores:
                        </span>
                        <p className="text-gray-800 text-sm font-cabin-medium">
                          {book.author_list && book.author_list.length > 0
                            ? book.author_list
                                .map((author) => author.author_name)
                                .join(", ")
                            : "No hay autores asignados"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    {isEditMode ? (
                      <div>
                        <span className="font-cabin-medium text-gray-600 block text-sm mb-1">
                          Descripción:
                        </span>
                        <textarea
                          value={editData.product_description}
                          onChange={(e) =>
                            handleInputChange(
                              "product_description",
                              e.target.value
                            )
                          }
                          rows="4"
                          className="w-full text-gray-600 leading-relaxed bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm font-cabin-medium"
                          placeholder="Descripción del libro..."
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                          {book.product_description ||
                            "Sin descripción disponible"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Grid de información detallada */}
                  {isEditMode ? (
                    <div className="space-y-4 text-sm">
                      {/* Fila 1: Precio - Precio Oferta - Descuento */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Precio Original:
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editData.price}
                              onChange={(e) =>
                                handleInputChange(
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-sm font-cabin-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Precio Oferta:
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editData.price_offer}
                              onChange={(e) =>
                                handleInputChange(
                                  "price_offer",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full text-sm font-cabin-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Descuento (%):
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editData.discount}
                            onChange={(e) =>
                              handleInputChange(
                                "discount",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full text-sm font-cabin-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Fila 2: Estado - Páginas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Estado:
                          </span>
                          <select
                            value={editData.status}
                            onChange={(e) =>
                              handleInputChange(
                                "status",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full text-sm font-cabin-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value={1}>Activo</option>
                            <option value={0}>Inactivo</option>
                          </select>
                        </div>
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Páginas:
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={editData.amount_pages}
                            onChange={(e) =>
                              handleInputChange(
                                "amount_pages",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full text-sm font-cabin-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      {/* Fila 3: Categorías - Temas */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Categorías:
                          </span>
                          <CustomDropdown
                            options={categoryOptions}
                            selectedValues={
                              editData.category_list?.map(
                                (category) => category.category_id
                              ) || []
                            }
                            onChange={(values) =>
                              setEditData((prev) => ({
                                ...prev,
                                category_list: values.map((id) => ({
                                  category_id: id,
                                  category_name:
                                    categoryMap[id] || `Categoría ${id}`,
                                })),
                              }))
                            }
                            placeholder="Seleccionar..."
                            multiple={true}
                            searchable={true}
                            className="w-full text-sm"
                          />
                        </div>
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Temas:
                          </span>
                          <CustomDropdown
                            options={topicOptions}
                            selectedValues={
                              editData.topic_list?.map(
                                (topic) => topic.topic_id
                              ) || []
                            }
                            onChange={(values) =>
                              setEditData((prev) => ({
                                ...prev,
                                topic_list: values.map((id) => ({
                                  topic_id: id,
                                  topic_name: topicMap[id] || `Tema ${id}`,
                                })),
                              }))
                            }
                            placeholder="Seleccionar..."
                            multiple={true}
                            searchable={true}
                            className="w-full text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-800">
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          Precio:
                        </span>
                        {/* {book.discount > 0 ? (
                        <span className="text-green-600 font-cabin-bold">{formatPrice(discountedPrice)}</span>
                      ) : (
                        <span className="font-cabin-medium">{formatPrice(book.price)}</span>
                      )} */}
                        <span className="font-cabin-medium">
                          {formatPrice(book.price_offer || book.price)}
                        </span>
                      </div>
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          Descuento:
                        </span>
                        <span className="font-cabin-medium">
                          {book.discount || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          Estado:
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            book.status === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {book.status === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      {/* <div>
                      <span className="font-cabin-medium text-gray-600 block">Stock:</span>
                      <span className="font-cabin-medium">{book.stock} unidades</span>
                    </div> */}
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          Páginas:
                        </span>
                        <span className="font-cabin-medium">
                          {book.amount_pages !== undefined &&
                          book.amount_pages !== null
                            ? book.amount_pages
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          Categorías:
                        </span>
                        <span className="font-cabin-medium">
                          {book.category_list && book.category_list.length > 0
                            ? book.category_list
                                .map((category) => category.category_name)
                                .join(", ")
                            : "No asignadas"}
                        </span>
                      </div>
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          Temas:
                        </span>
                        <span className="font-cabin-medium">
                          {book.topic_list && book.topic_list.length > 0
                            ? book.topic_list
                                .map((topic) => topic.topic_name)
                                .join(", ")
                            : "No asignados"}
                        </span>
                      </div>
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          SKU:
                        </span>
                        <span className="font-cabin-medium">
                          {book.sku || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-cabin-medium text-gray-600 block">
                          Stock:
                        </span>
                        <span className="font-cabin-medium">
                          {book.stock || 0} unidades
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-lg sm:rounded-b-xl">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-cabin-medium text-sm sm:text-base"
          >
            {isEditMode ? "Cancelar" : "Cerrar"}
          </button>
          {isEditMode && (
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-cabin-medium text-sm sm:text-base"
            >
              {mode === "create" ? "Crear Libro" : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookInformation;
