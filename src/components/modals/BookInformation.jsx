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
import { useAuthors, useCategories, useTopics } from "../../hooks/useCatalogs";
import { convertImageToWebpGetUrl, updateProduct, addProduct } from "../../api/products";
import { showSuccess, showError } from "../../utils/notifications";
import AuthorInformation from "./AuthorInformation";
import { addAuthor } from "../../api/authors";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [pendingImages, setPendingImages] = useState({
    main: null,
    additional: [null, null, null]
  });
  const [isSaving, setIsSaving] = useState(false);

  // Obtener datos del catálogo
  const { authors, isLoading: authorsLoading, error: authorsError, isInitialized: authorsInitialized, refreshAuthors } = useAuthors();
  const { categories } = useCategories();
  const { topics } = useTopics();

  // Convertir datos del catálogo a opciones para dropdowns
  const authorOptions = authors.map((author) => ({
    value: author.author_id,
    label: author.author_name,
  }));



  const categoryOptions = categories.map((category) => ({
    value: category.category_id,
    label: category.category_name,
  }));

  const topicOptions = topics.map((topic) => ({
    value: topic.topic_id,
    label: topic.topic_name,
  }));



  // Opciones para tipo de producto (solo Fisico por ahora)
  const productTypeOptions = [
    { value: "Fisico", label: "Físico" },
  ];

  // Inicializar datos de edición cuando se abre el modal
  useEffect(() => {
    if (isOpen && !isDataInitialized) {
      // Si book es null, es una creación
      if (!book) {

        setEditData({
          product_name: "",
          product_description: "",
          product_type: "Fisico",
          price: 0,
          price_offer: 0,
          discount: 0,
          stock: 0,
          amount_pages: 0,
          status: 1,
          main_image_url: "",
          category_list: [],
          topic_list: [],
          author_list: [],
        });
        setIsEditMode(true); // Siempre en modo edición para creación
        setIsDataInitialized(true);
        return;
      }

      // Si book existe, es una edición
      
      setEditData({
        product_name: book?.product_name || "",
        product_description: book?.product_description || "",
        product_type: book?.product_type || "",
        price: book?.price || 0,
        price_offer: book?.price_offer || 0,
        discount: book?.discount || 0,
        stock: book?.stock || 0,
        amount_pages: book?.amount_pages || 0,
        status: book?.status || 1,
        main_image_url: book?.main_image_url || "",
        category_list: book?.category_list || [],
        topic_list: book?.topic_list || [],
        author_list: book?.author_list || [],
      });
      setIsEditMode(mode === "create" || mode === "edit");
      setIsDataInitialized(true);
    }
  }, [isOpen, book, mode, isDataInitialized]); // Solo se ejecuta cuando no está inicializado

  // Resetear estado de inicialización cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setIsDataInitialized(false);
    }
  }, [isOpen]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
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

  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (originalPrice, discountPercent) => {
    if (!originalPrice || !discountPercent || discountPercent <= 0) {
      return originalPrice;
    }
    const discountAmount = originalPrice * (discountPercent / 100);
    const discountedPrice = originalPrice - discountAmount;
    return Math.round(discountedPrice); // Redondear al entero más cercano
  };

  // Función para manejar cambios en precio y descuento con cálculo automático
  const handlePriceOrDiscountChange = (field, value) => {
    let newValue;
    if (value === '') {
      newValue = 0;
    } else if (field === 'discount') {
      // Para descuento, forzar número entero y limitar a 0-100
      const parsedValue = Math.floor(parseFloat(value) || 0);
      newValue = Math.max(0, Math.min(100, parsedValue));
    } else if (field === 'price') {
      // Para precio, redondear al entero más cercano
      newValue = Math.round(parseFloat(value) || 0);
    } else {
      newValue = parseFloat(value) || 0;
    }
    
    setEditData((prev) => {
      const updatedData = {
        ...prev,
        [field]: newValue,
      };

      // Calcular automáticamente el precio de oferta
      if (field === 'price' || field === 'discount') {
        const price = field === 'price' ? newValue : prev.price;
        const discount = field === 'discount' ? newValue : prev.discount;
        
        if (discount > 0 && price > 0) {
          updatedData.price_offer = calculateDiscountedPrice(price, discount);
        } else {
          updatedData.price_offer = price; // Sin descuento, precio de oferta = precio original
        }
      }

      return updatedData;
    });
  };

  // Validación de archivos de imagen
  const validateImageFile = (file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      showError('Formato de imagen no válido. Solo se permiten PNG, JPEG, JPG y WebP.');
      return false;
    }

    if (file.size > maxSize) {
      showError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      return false;
    }

    return true;
  };

  // Función para obtener la extensión del archivo
  const getFileExtension = (file) => {
    const fileName = file.name;
    return fileName.split('.').pop().toLowerCase();
  };

  // Función para convertir imagen a base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Función para subir imagen a S3
  const uploadImageToS3 = async (file) => {
    try {
      const base64Image = await convertFileToBase64(file);
      const fileExtension = getFileExtension(file);
      
      const response = await convertImageToWebpGetUrl(
        base64Image,
        fileExtension,
        true
      );

      if (response.status === true) {
        return response.image_url;
      } else {
        throw new Error(response.status_Message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Función para subir todas las imágenes pendientes
  const uploadPendingImages = async () => {
    const uploadedImages = {
      main: null,
      additional: []
    };

    try {
      // Subir imagen principal si hay una pendiente
      if (pendingImages.main) {

        const mainImageUrl = await uploadImageToS3(pendingImages.main.file);
        uploadedImages.main = mainImageUrl;
      }

      // Subir imágenes adicionales pendientes
      for (let i = 0; i < pendingImages.additional.length; i++) {
        if (pendingImages.additional[i]) {

          const additionalImageUrl = await uploadImageToS3(pendingImages.additional[i].file);
          uploadedImages.additional[i] = additionalImageUrl;
        }
      }

      return uploadedImages;
    } catch (error) {
      console.error('Error uploading pending images:', error);
      throw error;
    }
  };

  // Funciones para drag and drop - Imagen principal
  const handleFileSelect = async (file) => {
    if (!validateImageFile(file)) return;

    try {
      const base64Image = await convertFileToBase64(file);
      
      // Guardar la imagen pendiente para subir después
      setPendingImages(prev => ({
        ...prev,
        main: {
          file,
          base64: base64Image,
          extension: getFileExtension(file)
        }
      }));
      
      // Mostrar preview en base64
      handleInputChange("main_image_url", base64Image);
      
      showSuccess('Imagen principal seleccionada (se subirá al guardar)');
    } catch (error) {
      showError('Error al procesar la imagen: ' + error.message);
    }
  };

  // Funciones para drag and drop - Imágenes adicionales
  const handleAdditionalFileSelect = async (file, index) => {
    if (!validateImageFile(file)) return;

    try {
      const base64Image = await convertFileToBase64(file);
      
      // Guardar la imagen pendiente para subir después
      setPendingImages(prev => {
        const updatedAdditional = [...prev.additional];
        updatedAdditional[index] = {
          file,
          base64: base64Image,
          extension: getFileExtension(file)
        };
        return {
          ...prev,
          additional: updatedAdditional
        };
      });
      
      // Mostrar preview en base64
      const updatedImages = [...(editData.additional_images || ["", "", ""])];
      updatedImages[index] = base64Image;
      setEditData((prev) => ({ ...prev, additional_images: updatedImages }));
      
      showSuccess(`Imagen adicional ${index + 1} seleccionada (se subirá al guardar)`);
    } catch (error) {
      showError(`Error al procesar la imagen adicional ${index + 1}: ` + error.message);
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
      setIsSaving(true);

      // Validar que haya una imagen principal
      if (!editData.main_image_url) {
        showError('Debe seleccionar una imagen principal para el producto');
        return;
      }

      // Validar campos requeridos
      if (!editData.product_name?.trim()) {
        showError('El nombre del producto es requerido');
        return;
      }

      if (!editData.author_list || editData.author_list.length === 0) {
        showError('Debe seleccionar al menos un autor');
        return;
      }

      if (!editData.category_list || editData.category_list.length === 0) {
        showError('Debe seleccionar al menos una categoría');
        return;
      }

      if (!editData.topic_list || editData.topic_list.length === 0) {
        showError('Debe seleccionar al menos un tema');
        return;
      }

      // Subir imágenes pendientes primero
      let finalMainImageUrl = editData.main_image_url;
      let finalAdditionalImages = [...(editData.additional_images || [])];

      if (pendingImages.main || pendingImages.additional.some(img => img)) {
    
        const uploadedImages = await uploadPendingImages();
        
        // Actualizar URLs con las imágenes subidas
        if (uploadedImages.main) {
          finalMainImageUrl = uploadedImages.main;
        }
        
        // Actualizar imágenes adicionales
        for (let i = 0; i < uploadedImages.additional.length; i++) {
          if (uploadedImages.additional[i]) {
            finalAdditionalImages[i] = uploadedImages.additional[i];
          }
        }
      }

      // Preparar datos para la actualización
      const productUpdateData = {
        product_id: book ? book.product_id : null,
        product_name: editData.product_name.trim(),
        product_description: editData.product_description?.trim() || "Sin descripcion",
        price: parseFloat(editData.price) || 0,
        price_offer: parseFloat(editData.price_offer) || 0,
        stock: parseInt(editData.stock) || 0,
        amount_pages: parseInt(editData.amount_pages) || 0,
        status: editData.status,
        author_id_list: editData.author_list.map(author => author.author_id || author),
        category_id_list: editData.category_list.map(category => category.category_id || category),
        topic_id_list: editData.topic_list.map(topic => topic.topic_id || topic),
        main_image_url: finalMainImageUrl,
        secondary_image_url_list: finalAdditionalImages.filter(url => url && url.trim() !== '')
      };

      // Determinar si es creación o edición
      let response;
      if (book && book.product_id) {
        // Es una edición
        response = await updateProduct(productUpdateData);
      } else {
        // Es una creación

        
        // Remover product_id para creación (no debe enviarse)
        const { product_id, ...productCreateData } = productUpdateData;
        
        // Agregar product_type para creación
        productCreateData.product_type = editData.product_type || "Fisico";
        
        response = await addProduct(productCreateData);
      }

      if (response.status === true) {
        const successMessage = book && book.product_id ? 'Producto actualizado correctamente' : 'Producto creado correctamente';
        showSuccess(successMessage);
        
        // Limpiar imágenes pendientes
        setPendingImages({
          main: null,
          additional: [null, null, null]
        });
        
        // Si hay una función onSave personalizada, llamarla
        if (onSave) {
          await onSave(editData);
        }
        
        onClose();
      } else {
        const errorMessage = book && book.product_id ? 'Error al actualizar el producto' : 'Error al crear el producto';
        showError(response.status_Message || errorMessage);
      }
    } catch (error) {
      console.error("Error saving book:", error);
      const errorMessage = book && book.product_id ? 'Error al guardar el libro' : 'Error al crear el libro';
      showError(errorMessage + ': ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (mode === "create") {
      onClose();
    } else {
      setIsEditMode(false);
      // Restaurar datos originales solo si no hay cambios pendientes
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

  // Función para preservar los datos actuales antes de abrir el modal de autor
  const handleOpenAuthorModal = () => {
    // Preservar el estado actual antes de abrir el modal de autor

    setShowAuthorModal(true);
  };

  // Función para manejar la creación de un nuevo autor
  const handleCreateAuthor = async (authorData) => {
    try {
  
      const response = await addAuthor(authorData);
      
      if (response.status === true) {
        showSuccess('Autor creado exitosamente');

        
        // Recargar solo el catálogo de autores

        await refreshAuthors();
        
        // Crear el objeto del nuevo autor
        const newAuthor = {
          author_id: response.author_id,
          author_name: authorData.author_name,
        };
        

        
        // Autoseleccionar el nuevo autor agregándolo a la lista
        setEditData(prev => {
          const updatedAuthorList = [...(prev.author_list || []), newAuthor];
  
          return {
            ...prev,
            author_list: updatedAuthorList
          };
        });
        
        // Forzar actualización del dropdown
        setForceUpdate(prev => prev + 1);
        
        setShowAuthorModal(false);
      } else {
        showError(response.status_Message || 'Error al crear el autor');
      }
    } catch (error) {
      console.error('Error creating author:', error);
      showError('Error al crear el autor: ' + error.message);
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
                      book &&
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
                        {editData.main_image_url || (book && book.main_image_url) ? (
                          <>
                            <img
                              src={
                                editData.main_image_url || (book && book.main_image_url)
                              }
                              alt={`Portada de ${book ? book.product_name : 'Nuevo libro'}`}
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
                              {pendingImages.main ? (
                                <div className="flex flex-col items-center">
                                  <div className="w-8 h-8 border-2 border-amber-600 rounded-full mb-3 flex items-center justify-center">
                                    <span className="text-xs text-amber-600 font-bold">P</span>
                                  </div>
                                  <span className="text-sm text-amber-600 font-cabin-medium">
                                    Pendiente de subir
                                  </span>
                                </div>
                              ) : (
                                <>
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
                                </>
                              )}
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
                        src={book && book.main_image_url ? book.main_image_url : placeholderImage}
                        alt={`Portada de ${book ? book.product_name : 'Nuevo libro'}`}
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
                                {pendingImages.additional[index] ? (
                                  <div className="w-4 h-4 border-2 border-amber-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-amber-600 font-bold">P</span>
                                  </div>
                                ) : (
                                  <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
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
                    book &&
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
                          {book ? book.product_name : 'Nuevo Libro'}
                        </h2>
                        {book && (
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-cabin-medium bg-blue-100 text-blue-800">
                              <FiFileText className="w-4 h-4 mr-1" />
                              {book.product_type}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Autores */}
                  <div>
                    {isEditMode ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-cabin-medium text-gray-600 block text-sm">
                            Autores:
                          </span>
                          <button
                            type="button"
                            onClick={handleOpenAuthorModal}
                            className="flex items-center text-xs text-amber-600 hover:text-amber-700 font-cabin-medium transition-colors"
                          >
                            <FiUser className="w-3 h-3 mr-1" />
                            Agregar Autor
                          </button>
                        </div>
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
                              author_list: values.map((id) => {
                                const author = authors.find(a => a.author_id === id);
                                return {
                                  author_id: id,
                                  author_name: author ? author.author_name : `Autor ${id}`,
                                };
                              }),
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
                          {book && book.author_list && book.author_list.length > 0
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
                          {book && book.product_description
                            ? book.product_description
                            : "Sin descripción disponible"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Grid de información detallada */}
                  {isEditMode ? (
                    <div className="space-y-4 text-sm">
                      {/* Fila 1: Precio Original - Descuento - Precio Oferta (calculado) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Precio Original:
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">$</span>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={editData.price === 0 ? '' : editData.price}
                              onChange={(e) => handlePriceOrDiscountChange("price", e.target.value)}
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
                            step="1"
                            value={editData.discount === 0 ? '' : editData.discount}
                            onChange={(e) => handlePriceOrDiscountChange("discount", e.target.value)}
                            className="w-full text-sm font-cabin-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Precio Oferta:
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-600">$</span>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={editData.price_offer === 0 ? '' : editData.price_offer}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleInputChange(
                                  "price_offer",
                                  value === '' ? 0 : Math.round(parseFloat(value) || 0)
                                );
                              }}
                              className={`w-full text-sm font-cabin-medium text-gray-800 bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                editData.discount > 0 ? 'border-green-300 bg-green-50' : 'border-gray-300'
                              }`}
                              placeholder={editData.discount > 0 ? "Calculado automáticamente" : "Igual al precio original"}
                            />
                          </div>
                          {editData.discount > 0 && editData.price > 0 && (
                            <div className="text-xs text-green-600 mt-1 font-cabin-medium">
                              💰 Ahorro: ${((editData.price - editData.price_offer) || 0).toFixed(2)} ({editData.discount}% de descuento)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fila 2: Estado - Páginas - Stock */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                            value={editData.amount_pages === 0 ? '' : editData.amount_pages}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange(
                                "amount_pages",
                                value === '' ? 0 : parseInt(value) || 0
                              );
                            }}
                            className="w-full text-sm font-cabin-medium text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <span className="font-cabin-medium text-gray-600 block mb-1">
                            Stock:
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={editData.stock === 0 ? '' : editData.stock}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange(
                                "stock",
                                value === '' ? 0 : parseInt(value) || 0
                              );
                            }}
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
                                category_list: values.map((id) => {
                                  const category = categories.find(c => c.category_id === id);
                                  return {
                                    category_id: id,
                                    category_name: category ? category.category_name : `Categoría ${id}`,
                                  };
                                }),
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
                                topic_list: values.map((id) => {
                                  const topic = topics.find(t => t.topic_id === id);
                                  return {
                                    topic_id: id,
                                    topic_name: topic ? topic.topic_name : `Tema ${id}`,
                                  };
                                }),
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
                  ) : book ? (
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
                          {Math.round(book.discount || 0)}%
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
                  ) : null}
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
              disabled={isSaving}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg transition-colors font-cabin-medium text-sm sm:text-base ${
                isSaving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                  {pendingImages.main || pendingImages.additional.some(img => img) 
                    ? 'Subiendo imágenes y guardando...' 
                    : 'Guardando...'
                  }
                </>
              ) : (
                mode === "create" ? "Crear Libro" : "Guardar Cambios"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal para crear nuevo autor */}
      <AuthorInformation
        isOpen={showAuthorModal}
        onClose={() => setShowAuthorModal(false)}
        mode="create"
        onSave={handleCreateAuthor}
      />
    </div>
  );
};

export default BookInformation;
