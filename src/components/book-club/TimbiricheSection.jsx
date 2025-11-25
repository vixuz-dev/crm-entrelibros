import React, { useState } from 'react';
import { FiGrid } from 'react-icons/fi';
import TimbiricheSquare from './TimbiricheSquare';
import TimbiricheSquareModal from './TimbiricheSquareModal';
import { useBookClubStore } from '../../store/useBookClubStore';

const TimbiricheSection = () => {
  const { timbiriche, updateSquare } = useBookClubStore();
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Configuración del layout del tablero (patrón del timbiriche)
  const boardLayout = [
    [1], // Square 1 solo
    [2, 3], // Squares 2 y 3 lado a lado
    [4], // Square 4 solo
    [5, 6], // Squares 5 y 6 lado a lado
    [7], // Square 7 solo
    [8, 9], // Squares 8 y 9 lado a lado
    [10] // Square 10 solo
  ];

  const handleSquareClick = (squareNumber) => {
    setSelectedSquare(squareNumber);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSquare(null);
  };

  const handleSaveSquare = (squareData) => {
    if (selectedSquare) {
      updateSquare(selectedSquare, squareData);
      handleCloseModal();
    }
  };

  // Función para obtener el square data
  const getSquareData = (squareNumber) => {
    const squareKey = `square${squareNumber}`;
    return timbiriche[squareKey] || null;
  };

  // Función para obtener el día de desbloqueo desde los datos guardados o valor por defecto
  const getUnlockDay = (squareNumber, squareData) => {
    // Si ya tiene datos guardados, usar ese unlockDay
    if (squareData?.unlockDay) {
      return squareData.unlockDay;
    }
    // Valores por defecto según el square (solo para nuevos squares)
    if (squareNumber <= 3) return 1;
    if (squareNumber <= 5) return 7;
    if (squareNumber <= 7) return 14;
    return 21;
  };

  // Función para obtener el tipo desde los datos guardados o valor por defecto
  const getSquareType = (squareNumber, squareData) => {
    // Si ya tiene datos guardados, usar ese type
    if (squareData?.type) {
      return squareData.type;
    }
    // Valores por defecto (solo para nuevos squares)
    // Por ahora solo square 1 tiene tipo por defecto
    if (squareNumber === 1) return 'book';
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
          Timbiriche
        </h2>
        <p className="text-gray-600 font-cabin-regular">
          Configura las casillas del juego Timbiriche. Cada casilla se desbloquea en diferentes días.
        </p>
      </div>

      {/* Tablero visual del timbiriche */}
      <div className="space-y-4">
        {boardLayout.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex ${
              row.length === 1 ? 'justify-center' : 'justify-center gap-4'
            }`}
          >
            {row.map((squareNumber) => {
              const squareData = getSquareData(squareNumber);
              const unlockDay = getUnlockDay(squareNumber, squareData);
              const type = getSquareType(squareNumber, squareData);

              return (
                <TimbiricheSquare
                  key={squareNumber}
                  squareNumber={squareNumber}
                  unlockDay={unlockDay}
                  type={type}
                  squareData={squareData}
                  onClick={() => handleSquareClick(squareNumber)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {isModalOpen && selectedSquare && (
        <TimbiricheSquareModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveSquare}
          squareNumber={selectedSquare}
          squareData={getSquareData(selectedSquare)}
          defaultUnlockDay={getUnlockDay(selectedSquare, getSquareData(selectedSquare))}
          defaultType={getSquareType(selectedSquare, getSquareData(selectedSquare))}
        />
      )}
    </div>
  );
};

export default TimbiricheSection;

