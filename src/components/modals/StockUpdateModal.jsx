import React, { useState, useEffect } from "react";
import {
  FiX,
  FiPackage,
  FiPlus,
  FiMinus,
  FiSave,
  FiRotateCcw,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { updateProductStock } from "../../api/products";
import {
  showStockUpdateSuccess,
  showStockUpdateError,
} from "../../utils/notifications";

const StockUpdateModal = ({
  product,
  isOpen,
  onClose,
  onStockUpdated,
  currentStock = 0,
}) => {
  const [stockChange, setStockChange] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resetear el modal cuando se abre
  useEffect(() => {
    if (isOpen) {
      setStockChange(0);
      setError(null);
    }
  }, [isOpen]);

  const handleStockChange = (change) => {
    setStockChange((prev) => {
      const newValue = prev + change;
      // Evitar valores negativos que resulten en stock negativo
      if (currentStock + newValue < 0) {
        return -currentStock; // Máximo que se puede reducir
      }
      return newValue;
    });
  };

  const handleQuickChange = (amount) => {
    setStockChange(amount);
  };

  const handleSave = async () => {
    if (stockChange === 0) {
      setError("No hay cambios para guardar");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await updateProductStock(
        product.product_id,
        stockChange
      );

      if (response.status === true) {
        // Mostrar notificación de éxito
        showStockUpdateSuccess(
          product.product_name,
          currentStock,
          currentStock + stockChange
        );

        // Llamar callback para actualizar la UI
        if (onStockUpdated) {
          onStockUpdated(product.product_id, currentStock + stockChange);
        }
        onClose();
      } else {
        const errorMessage =
          response.status_Message || "Error al actualizar el stock";
        setError(errorMessage);
        showStockUpdateError(product.product_name, errorMessage);
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      const errorMessage =
        error.response?.data?.status_Message ||
        "Error al actualizar el stock. Intenta de nuevo.";
      setError(errorMessage);
      showStockUpdateError(product.product_name, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStockChange(0);
    setError(null);
    onClose();
  };

  const getNewStock = () => currentStock + stockChange;
  const isStockIncrease = stockChange > 0;
  const isStockDecrease = stockChange < 0;
  const hasChanges = stockChange !== 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-cabin-bold text-gray-800">
                Actualizar Stock
              </h2>
              <p className="text-sm text-gray-600">{product?.product_name}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Stock Actual */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm font-cabin-medium text-gray-600 mb-1">
                  Stock Actual
                </p>
                <p className="text-3xl font-cabin-bold text-gray-800">
                  {currentStock}
                </p>
                <p className="text-xs text-gray-500">unidades</p>
              </div>
            </div>

            {/* Controles de Cambio */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-cabin-medium text-gray-600 mb-3">
                  Cambio de Stock
                </p>

                {/* Controles principales */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={() => handleStockChange(-1)}
                    disabled={getNewStock() < 0}
                    className="w-12 h-12 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                  >
                    <FiMinus className="w-5 h-5 text-red-600" />
                  </button>

                  <div className="min-w-[80px] text-center">
                    <div
                      className={`text-2xl font-cabin-bold ${
                        isStockIncrease
                          ? "text-green-600"
                          : isStockDecrease
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {stockChange > 0 ? "+" : ""}
                      {stockChange}
                    </div>
                    <div className="text-xs text-gray-500">cambio</div>
                  </div>

                  <button
                    onClick={() => handleStockChange(1)}
                    className="w-12 h-12 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <FiPlus className="w-5 h-5 text-green-600" />
                  </button>
                </div>

                {/* Botones rápidos */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => handleQuickChange(-5)}
                    disabled={getNewStock() < 0}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-red-600 rounded-lg text-sm font-cabin-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <FiTrendingDown className="w-4 h-4" />
                    <span>-5</span>
                  </button>
                  <button
                    onClick={() => handleQuickChange(5)}
                    className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-cabin-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <FiTrendingUp className="w-4 h-4" />
                    <span>+5</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickChange(-10)}
                    disabled={getNewStock() < 0}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed text-red-600 rounded-lg text-sm font-cabin-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <FiTrendingDown className="w-4 h-4" />
                    <span>-10</span>
                  </button>
                  <button
                    onClick={() => handleQuickChange(10)}
                    className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-cabin-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <FiTrendingUp className="w-4 h-4" />
                    <span>+10</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Resultante */}
            <div
              className={`rounded-lg p-4 border-2 transition-colors ${
                hasChanges
                  ? isStockIncrease
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="text-center">
                <p className="text-sm font-cabin-medium text-gray-600 mb-1">
                  Stock Resultante
                </p>
                <p
                  className={`text-2xl font-cabin-bold ${
                    hasChanges
                      ? isStockIncrease
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  {getNewStock()}
                </p>
                <p className="text-xs text-gray-500">unidades</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 font-cabin-medium">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-cabin-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FiRotateCcw className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors font-cabin-medium text-sm flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
