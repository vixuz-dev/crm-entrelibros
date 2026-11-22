import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiSearch, FiEdit, FiEye, FiRefreshCw, FiX, FiXCircle, FiCheckCircle } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';
import ComboInformation from '../components/modals/ComboInformation';
import StockUpdateModal from '../components/modals/StockUpdateModal';
import StockIndicator from '../components/ui/StockIndicator';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import { useCombosInformation } from '../store/useCombosInformation';
import { getProductDetail, deactivateProduct } from '../api/products';
import { showSuccess, showError } from '../utils/notifications';
import placeholderImage from '../assets/images/placeholder.jpg';

const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

const renderStatus = (status) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    <span className={`w-2 h-2 rounded-full mr-1 ${status === 1 ? 'bg-green-400' : 'bg-red-400'}`} />
    {status === 1 ? 'Activo' : 'Inactivo'}
  </span>
);

/** Combos: lo que se vende. Cada combo agrupa libros de la biblioteca. */
const Combos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [stockCombo, setStockCombo] = useState(null);
  const [comboToToggle, setComboToToggle] = useState(null);

  const {
    combos, currentPage, totalPages, totalCombos, totalAvailable, totalDisabled,
    limit, isLoading, error, isInitialized, loadCombos, refreshCombos, goToPage, changeLimit,
  } = useCombosInformation();

  useEffect(() => {
    if (!isInitialized) loadCombos(1, limit);
  }, [isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isInitialized) loadCombos(1, limit, debouncedSearchTerm);
  }, [debouncedSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setModalMode('create'); setSelectedCombo(null); setShowModal(true); };
  const openEdit = (combo) => { setModalMode('edit'); setSelectedCombo(combo); setShowModal(true); };
  const openView = async (combo) => {
    try {
      setIsLoadingDetail(true);
      setModalMode('view');
      setSelectedCombo(combo);
      setShowModal(true);
      const response = await getProductDetail(combo.product_id);
      if (response.status === true) setSelectedCombo(response.product);
    } catch (e) {
      console.error('Error loading combo detail:', e); // se conservan los datos básicos
    } finally {
      setIsLoadingDetail(false);
    }
  };
  const closeModal = () => { setShowModal(false); setSelectedCombo(null); setModalMode('view'); };

  const confirmToggle = async () => {
    if (!comboToToggle) return;
    const target = comboToToggle;
    setComboToToggle(null);
    try {
      await deactivateProduct(target.product_id);
      showSuccess(`Combo ${target.status ? 'desactivado' : 'activado'} correctamente`);
      await refreshCombos(debouncedSearchTerm);
    } catch (e) {
      showError(e.message || 'Error al cambiar el estado del combo');
    }
  };

  const th = 'px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">Combos</h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Los combos son lo que se vende: cada uno agrupa libros de la biblioteca.
          </p>
        </div>
        <button onClick={openCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto">
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nuevo Combo</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[
          { label: 'Combos', value: totalCombos, hint: 'Registrados', box: 'bg-blue-100', icon: 'text-blue-600', num: 'text-blue-600' },
          { label: 'A la venta', value: totalAvailable, hint: 'Activos con stock', box: 'bg-green-100', icon: 'text-green-600', num: 'text-green-600' },
          { label: 'Sin vender', value: totalDisabled, hint: 'Inactivos y sin stock', box: 'bg-red-100', icon: 'text-red-600', num: 'text-red-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${card.box} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <FiPackage className={`w-5 h-5 lg:w-6 lg:h-6 ${card.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-cabin-semibold text-gray-800 text-sm lg:text-base">{card.label}</h3>
                <p className={`text-xl lg:text-2xl font-cabin-bold ${card.num}`}>{isLoading ? '...' : card.value}</p>
                <p className="text-xs lg:text-sm font-cabin-regular text-gray-500">{card.hint}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
          <input type="text" placeholder="Buscar combos por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 lg:pl-10 pr-20 lg:pr-24 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm lg:text-base" />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-12 lg:right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Limpiar búsqueda">
              <FiX className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          )}
          <button onClick={() => refreshCombos(debouncedSearchTerm)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Actualizar">
            <FiRefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
            <p className="mt-4 text-gray-600 font-cabin-medium">Cargando combos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-cabin-medium">{error}</p>
            <button onClick={() => refreshCombos(debouncedSearchTerm)} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">Reintentar</button>
          </div>
        ) : combos.length === 0 ? (
          <div className="p-10 text-center">
            <div className="flex flex-col items-center space-y-3">
              <FiPackage className="w-16 h-16 text-gray-300" />
              {searchTerm ? (
                <p className="text-gray-600 font-cabin-medium">No hay combos que coincidan con "{searchTerm}"</p>
              ) : (
                <>
                  <p className="text-gray-700 font-cabin-semibold">Aún no hay combos</p>
                  <p className="text-sm text-gray-500 font-cabin-regular max-w-md">
                    Primero da de alta los libros en la sección Libros y después crea un combo eligiendo cuáles incluye.
                  </p>
                  <button onClick={openCreate} className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-cabin-medium">Crear el primer combo</button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={th}>Combo</th>
                    <th className={th}>Libros</th>
                    <th className={th}>Precio</th>
                    <th className={th}>Estado</th>
                    <th className={th}>Stock</th>
                    <th className={th}>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {combos.map((combo) => {
                    const items = combo.bundle_items || [];
                    const price = Number(combo.price) || 0;
                    const offer = Number(combo.price_offer) || 0;
                    const hasDiscount = offer > 0 && offer < price;
                    return (
                      <tr key={combo.product_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={combo.main_image_url || placeholderImage} alt={combo.product_name}
                              className="h-12 w-12 rounded-lg object-cover shadow-sm flex-shrink-0"
                              onError={(e) => { e.target.src = placeholderImage; }} />
                            <div className="ml-4 text-sm font-cabin-semibold text-gray-900">{combo.product_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex -space-x-3">
                              {items.slice(0, 4).map((book) => (
                                <img key={book.product_id} src={book.cover_url || placeholderImage} alt={book.title} title={book.title}
                                  className="h-10 w-7 rounded object-cover ring-2 ring-white shadow-sm"
                                  onError={(e) => { e.target.src = placeholderImage; }} />
                              ))}
                            </div>
                            <span className="ml-3 text-sm text-gray-600">{items.length} {items.length === 1 ? 'libro' : 'libros'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{money(hasDiscount ? offer : price)}</div>
                          {hasDiscount && <div className="text-xs text-red-600">-{Math.round((1 - offer / price) * 100)}% descuento</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{renderStatus(combo.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => setStockCombo(combo)}
                            className="w-full text-left hover:bg-blue-50 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            title={`Actualizar stock de "${combo.product_name}" (actual: ${combo.stock || 0})`}>
                            <div className="text-sm font-cabin-semibold text-gray-900">{combo.stock || 0} unidades</div>
                            <div className="text-xs text-gray-500"><StockIndicator stock={combo.stock || 0} showLabel={true} size="sm" /></div>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => openView(combo)} className="text-amber-600 hover:text-amber-900 p-1" title="Ver detalles"><FiEye className="w-4 h-4" /></button>
                            <button onClick={() => openEdit(combo)} className="text-blue-600 hover:text-blue-900 p-1" title="Editar"><FiEdit className="w-4 h-4" /></button>
                            <button onClick={() => setComboToToggle(combo)}
                              className={`p-1 ${combo.status ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                              title={combo.status ? 'Desactivar' : 'Activar'}>
                              {combo.status ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalCombos} itemsPerPage={limit}
                onPageChange={(page) => goToPage(page, debouncedSearchTerm)}
                onItemsPerPageChange={(n) => changeLimit(n, debouncedSearchTerm)}
                itemsPerPageOptions={[8, 16, 24, 32]} />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <ComboInformation combo={selectedCombo} isOpen={showModal} onClose={closeModal} mode={modalMode}
          onSave={() => refreshCombos(debouncedSearchTerm)} isLoadingDetail={isLoadingDetail} />
      )}

      {stockCombo && (
        <StockUpdateModal product={stockCombo} isOpen={!!stockCombo} onClose={() => setStockCombo(null)}
          onStockUpdated={() => { setStockCombo(null); refreshCombos(debouncedSearchTerm); }}
          currentStock={stockCombo.stock || 0} />
      )}

      {comboToToggle && (
        <ConfirmationModal isOpen={!!comboToToggle}
          title={comboToToggle.status ? 'Desactivar combo' : 'Activar combo'}
          description={comboToToggle.status
            ? `¿Quieres desactivar "${comboToToggle.product_name}"? Dejará de verse en la tienda.`
            : `¿Quieres activar "${comboToToggle.product_name}"? Se verá en la tienda si tiene stock.`}
          onCancel={() => setComboToToggle(null)} onAccept={confirmToggle}
          cancelText="Cancelar" acceptText={comboToToggle.status ? 'Desactivar' : 'Activar'}
          type={comboToToggle.status ? 'danger' : 'info'} />
      )}
    </div>
  );
};

export default Combos;
