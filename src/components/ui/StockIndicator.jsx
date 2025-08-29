import React from 'react';

const StockIndicator = ({ stock, showLabel = true, size = 'sm' }) => {
  const getStockStatus = (stockValue) => {
    if (stockValue > 10) {
      return {
        color: 'bg-green-400',
        label: 'Disponible',
        textColor: 'text-green-600'
      };
    } else if (stockValue > 0) {
      return {
        color: 'bg-yellow-400',
        label: 'Stock bajo',
        textColor: 'text-yellow-600'
      };
    } else {
      return {
        color: 'bg-red-400',
        label: 'Agotado',
        textColor: 'text-red-600'
      };
    }
  };

  const status = getStockStatus(stock);
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center space-x-1">
      <div className={`${status.color} ${sizeClasses[size]} rounded-full`}></div>
      {showLabel && (
        <span className={`text-xs ${status.textColor} font-cabin-medium`}>
          {status.label}
        </span>
      )}
    </div>
  );
};

export default StockIndicator;
