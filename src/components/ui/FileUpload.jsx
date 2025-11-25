import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiMusic, FiFileText } from 'react-icons/fi';

const FileUpload = ({
  value,
  onChange,
  onFileSelect,
  accept,
  allowedExtensions = [],
  maxSize = 50 * 1024 * 1024, // 50MB por defecto
  fileTypeLabel = 'archivo',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Obtener icono según el tipo de archivo
  const getFileIcon = () => {
    if (accept?.includes('audio') || accept?.includes('video')) {
      return FiMusic;
    }
    if (accept?.includes('pdf')) {
      return FiFileText;
    }
    return FiFile;
  };

  const FileIcon = getFileIcon();

  // Validar archivo
  const validateFile = (file) => {
    setError('');
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return false;
    }

    // Validar extensión si se especificaron
    if (allowedExtensions.length > 0) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        setError(`Solo se permiten archivos: ${allowedExtensions.join(', ').toUpperCase()}`);
        return false;
      }
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
      const base64File = await convertFileToBase64(file);
      
      // Si hay callback para manejar el archivo
      if (onFileSelect) {
        onFileSelect(file, base64File);
      }
      
      // Actualizar el valor (URL o base64)
      if (onChange) {
        onChange(base64File);
      }
    } catch (error) {
      setError('Error al procesar el archivo: ' + error.message);
    }
  };

  // Manejar drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
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
    // Solo abrir el diálogo si no hay archivo o si se hace clic directamente en el área de drop
    if (!hasFile) {
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

  // Remover archivo
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

  // Verificar si hay un archivo (URL o base64)
  const hasFile = value && (value.startsWith('http') || value.startsWith('data:'));

  // Obtener nombre del archivo si es una URL
  const getFileName = () => {
    if (!value) return '';
    if (value.startsWith('http')) {
      return value.split('/').pop();
    }
    return 'Archivo seleccionado';
  };

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!hasFile ? handleClick : undefined}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all
          ${hasFile ? '' : 'cursor-pointer'}
          ${isDragging 
            ? 'border-amber-500 bg-amber-50' 
            : hasFile
            ? 'border-gray-300 hover:border-gray-400'
            : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
          }
        `}
      >
        {hasFile ? (
          <div className="relative">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileIcon className="w-8 h-8 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-cabin-medium text-gray-800 truncate">
                  {getFileName()}
                </p>
                <p className="text-xs text-gray-500">
                  {value.startsWith('http') ? 'URL externa' : 'Archivo cargado'}
                </p>
              </div>
            </div>
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
              title="Haz clic para cambiar el archivo"
            />
          </div>
        ) : (
          <div className="text-center">
            <FileIcon
              className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                isDragging
                  ? "text-amber-600"
                  : "text-gray-400"
              }`}
            />
            <p className="text-sm font-cabin-medium text-gray-600 mb-1">
              {isDragging ? "Suelta el archivo aquí" : `Subir ${fileTypeLabel}`}
            </p>
            <p className="text-xs text-gray-500">
              Arrastra un archivo o haz clic para seleccionar
            </p>
            {allowedExtensions.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Formatos permitidos: {allowedExtensions.join(', ').toUpperCase()}
              </p>
            )}
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

export default FileUpload;

