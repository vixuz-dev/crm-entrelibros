import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

const ImageUpload = ({
  value,
  onChange,
  onFileSelect,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Extensiones permitidas
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

  // Validar archivo
  const validateFile = (file) => {
    setError('');
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return false;
    }

    // Validar tipo de archivo
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Solo se permiten archivos PNG, JPG, JPEG o WEBP');
      return false;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return false;
    }

    return true;
  };

  // Convertir archivo a base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Manejar selección de archivo
  const handleFileSelect = async (file) => {
    if (!validateFile(file)) {
      return;
    }

    try {
      const base64Image = await convertFileToBase64(file);
      
      // Si hay callback para manejar el archivo
      if (onFileSelect) {
        onFileSelect(file, base64Image);
      }
      
      // Actualizar el valor (URL o base64)
      if (onChange) {
        onChange(base64Image);
      }
    } catch (error) {
      setError('Error al procesar la imagen: ' + error.message);
    }
  };

  // Manejar drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Manejar drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Manejar drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Manejar click en el área
  const handleClick = (e) => {
    // Solo abrir el diálogo si no hay imagen
    if (!hasImage) {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
    }
  };

  // Manejar cambio de input file
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
    // Resetear el input para permitir seleccionar el mismo archivo de nuevo
    // Hacerlo de forma asíncrona para evitar que se dispare inmediatamente
    requestAnimationFrame(() => {
      if (e.target) {
        e.target.value = '';
      }
    });
  };

  // Remover imagen
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
    if (onFileSelect) {
      onFileSelect(null, null);
    }
    setError('');
  };

  // Verificar si hay una imagen (URL o base64)
  const hasImage = value && (value.startsWith('http') || value.startsWith('data:image'));

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!hasImage ? handleClick : undefined}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all
          ${hasImage ? '' : 'cursor-pointer'}
          ${isDragging 
            ? 'border-amber-500 bg-amber-50' 
            : hasImage
            ? 'border-gray-300 hover:border-gray-400'
            : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
          }
        `}
      >
        {hasImage ? (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors z-10"
            >
              <FiX className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
              title="Haz clic para cambiar la imagen"
            />
          </div>
        ) : (
          <div className="text-center">
            <FiUpload
              className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                isDragging
                  ? "text-amber-600"
                  : "text-gray-400"
              }`}
            />
            <p className="text-sm font-cabin-medium text-gray-600 mb-1">
              {isDragging ? "Suelta la imagen aquí" : "Subir imagen del banner"}
            </p>
            <p className="text-xs text-gray-500">
              Arrastra una imagen o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Formatos permitidos: PNG, JPG, JPEG, WEBP
            </p>
          </div>
        )}

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-red-500 text-xs font-cabin-regular mt-2">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;

