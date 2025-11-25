import React from 'react';
import { FiBook, FiActivity, FiHeadphones, FiEdit2 } from 'react-icons/fi';

const TimbiricheSquare = ({
  squareNumber,
  unlockDay: propUnlockDay,
  type: propType,
  squareData,
  onClick
}) => {
  // Usar unlockDay de squareData si existe, sino usar el prop
  const unlockDay = squareData?.unlockDay || propUnlockDay;
  // Usar type de squareData si existe, sino usar el prop
  const type = squareData?.type || propType;
  // Determinar el color y estado del square
  const getSquareStyles = () => {
    const isConfigured = squareData !== null;
    
    if (isConfigured) {
      return {
        bg: 'bg-amber-100 hover:bg-amber-200',
        border: 'border-2 border-amber-500',
        text: 'text-amber-800'
      };
    }
    
    return {
      bg: 'bg-gray-100 hover:bg-gray-200',
      border: 'border-2 border-gray-300 border-dashed',
      text: 'text-gray-600'
    };
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'book':
        return <FiBook className="w-5 h-5" />;
      case 'activity':
        return <FiActivity className="w-5 h-5" />;
      case 'audio':
        return <FiHeadphones className="w-5 h-5" />;
      default:
        return <FiEdit2 className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'book':
        return 'Libro';
      case 'activity':
        return 'Actividad';
      case 'audio':
        return 'Audio';
      default:
        return 'Sin tipo';
    }
  };

  const styles = getSquareStyles();

  return (
    <button
      onClick={onClick}
      className={`
        ${styles.bg}
        ${styles.border}
        ${styles.text}
        rounded-lg p-4 min-w-[120px] min-h-[120px]
        flex flex-col items-center justify-center
        transition-all duration-200
        cursor-pointer
        relative
        group
      `}
    >
      {/* Número del square */}
      <div className="absolute top-2 left-2">
        <span className="text-lg font-cabin-bold">{squareNumber}</span>
      </div>

      {/* Icono del tipo */}
      <div className="mb-2">
        {getTypeIcon()}
      </div>

      {/* Tipo */}
      <div className="text-xs font-cabin-medium mb-1">
        {getTypeLabel()}
      </div>

      {/* Día de desbloqueo */}
      <div className="text-xs font-cabin-regular opacity-75">
        Día {unlockDay}
      </div>

      {/* Indicador de estado */}
      {squareData && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      )}

      {/* Overlay al hover - oculta el contenido y muestra acción */}
      <div className="absolute inset-0 bg-amber-100 group-hover:bg-amber-200 rounded-lg transition-all duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 z-10">
        <div className="mb-2">
          {getTypeIcon()}
        </div>
        <span className="text-xs font-cabin-medium">
          {squareData ? 'Editar' : 'Configurar'}
        </span>
      </div>
    </button>
  );
};

export default TimbiricheSquare;

