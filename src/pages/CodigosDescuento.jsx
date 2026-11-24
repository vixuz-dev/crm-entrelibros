import React, { useState, useEffect, useCallback } from 'react';
import { FiTag, FiPlus, FiSearch, FiEdit, FiRefreshCw, FiX, FiXCircle, FiCheckCircle, FiCopy } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';
import DiscountCodeModal from '../components/modals/DiscountCodeModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Pagination from '../components/ui/Pagination';
import { getDiscountCodes, updateDiscountCode } from '../api/discounts';
import { getSeasons } from '../api/store';
import { showSuccess, showError } from '../utils/notifications';

const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);
const fmtDate = (v) => (v ? new Date(String(v).replace(' ', 'T')).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : null);

const describeValue = (c) => {
  if (c.type === 'FREE_SHIPPING') return 'Envío gratis';
  if (c.type === 'PERCENT') return `${Number(c.value)} %${c.max_discount ? ` (tope ${money(c.max_discount)})` : ''}`;
  return money(c.value);
};

/** Estado práctico del código, como lo vería quien lo usa. */
const codeState = (c) => {
  const now = new Date();
  if (!c.status) return { label: 'Desactivado', cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
  if (c.ends_at && new Date(String(c.ends_at).replace(' ', 'T')) < now) return { label: 'Vencido', cls: 'bg-red-100 text-red-800', dot: 'bg-red-400' };
  if (c.starts_at && new Date(String(c.starts_at).replace(' ', 'T')) > now) return { label: 'Programado', cls: 'bg-blue-100 text-blue-800', dot: 'bg-blue-400' };
  if (c.max_uses_total != null && Number(c.uses) >= Number(c.max_uses_total)) return { label: 'Agotado', cls: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' };
  return { label: 'Vigente', cls: 'bg-green-100 text-green-800', dot: 'bg-green-400' };
};

const PAGE_SIZE = 20;

/** Códigos de descuento: crear (uno, lote o personales), ver usos y activar/desactivar. */
const CodigosDescuento = () => {
  const [codes, setCodes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seasons, setSeasons] = useState([]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selected, setSelected] = useState(null);
  const [toToggle, setToToggle] = useState(null);

  const load = useCallback(async (targetPage = 1, size = pageSize) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDiscountCodes({
        search: debouncedSearch.trim(), status: statusFilter, season_id: seasonFilter, page: targetPage, page_size: size,
      });
      setCodes(data.discount_codes || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setPage(data.page || targetPage);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, seasonFilter, pageSize]);

  useEffect(() => { load(1); }, [load]);
  useEffect(() => {
    getSeasons().then((d) => setSeasons(d.season_list || [])).catch(() => setSeasons([]));
  }, []);

  const openCreate = () => { setModalMode('create'); setSelected(null); setShowModal(true); };
  const openEdit = (c) => { setModalMode('edit'); setSelected(c); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelected(null); };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); showSuccess(`Copiado: ${text}`); }
    catch { showError('No se pudo copiar el código'); }
  };

  const confirmToggle = async () => {
    if (!toToggle) return;
    const target = toToggle;
    setToToggle(null);
    try {
      await updateDiscountCode({ code_id: target.code_id, status: target.status ? 0 : 1 });
      showSuccess(`Código ${target.status ? 'desactivado' : 'activado'}`);
      load(page);
    } catch (e) {
      showError(e.message || 'Error al cambiar el estado');
    }
  };

  const th = 'px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider';
  const hasFilters = search || statusFilter || seasonFilter;
  const selectCls = 'px-3 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm bg-white';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">Códigos de descuento</h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Crea códigos sueltos, lotes o códigos personales por correo. Cada persona puede usar un código una sola vez.
          </p>
        </div>
        <button onClick={openCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto">
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Nuevos códigos</span>
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
          <input type="text" placeholder="Buscar por código, descripción o correo..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 lg:pl-10 pr-20 lg:pr-24 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm lg:text-base" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-12 lg:right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Limpiar búsqueda">
              <FiX className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          )}
          <button onClick={() => load(page)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Actualizar">
            <FiRefreshCw className={`w-4 h-4 lg:w-5 lg:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="">Todos los estados</option>
            <option value="1">Activados</option>
            <option value="0">Desactivados</option>
          </select>
          <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className={selectCls}>
            <option value="">Todas las temporadas</option>
            {seasons.map((s) => <option key={s.season_id} value={s.season_id}>{s.name}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); setSeasonFilter(''); }} className="text-sm text-amber-700 hover:underline text-left sm:ml-auto">
              Quitar filtros
            </button>
          )}
        </div>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading && codes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
            <p className="mt-4 text-gray-600 font-cabin-medium">Cargando códigos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-cabin-medium">{error}</p>
            <button onClick={() => load(page)} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">Reintentar</button>
          </div>
        ) : codes.length === 0 ? (
          <div className="p-10 text-center">
            <div className="flex flex-col items-center space-y-3">
              <FiTag className="w-16 h-16 text-gray-300" />
              {hasFilters ? (
                <p className="text-gray-600 font-cabin-medium">No hay códigos con esos filtros.</p>
              ) : (
                <>
                  <p className="text-gray-700 font-cabin-semibold">Aún no hay códigos de descuento</p>
                  <p className="text-sm text-gray-500 font-cabin-regular max-w-md">Crea el primero, por ejemplo un 10 % de descuento para la temporada.</p>
                  <button onClick={openCreate} className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-cabin-medium">Crear el primer código</button>
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
                    <th className={th}>Código</th>
                    <th className={th}>Descuento</th>
                    <th className={th}>Vigencia</th>
                    <th className={th}>Usos</th>
                    <th className={th}>Estado</th>
                    <th className={th}>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codes.map((c) => {
                    const state = codeState(c);
                    return (
                      <tr key={c.code_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono font-semibold text-gray-900">{c.code}</span>
                            <button onClick={() => copy(c.code)} className="text-gray-400 hover:text-amber-600 p-1" title="Copiar código"><FiCopy className="w-4 h-4" /></button>
                          </div>
                          <div className="text-xs text-gray-500 max-w-[260px] truncate">
                            {c.assigned_email ? `Personal: ${c.assigned_email}` : c.description || ''}
                            {c.season_name ? `${c.assigned_email || c.description ? ' · ' : ''}${c.season_name}` : ''}
                            {c.batch_label ? ` · lote ${c.batch_label}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{describeValue(c)}</div>
                          {c.min_subtotal && <div className="text-xs text-gray-500">Desde {money(c.min_subtotal)}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {c.starts_at || c.ends_at ? (
                            <>
                              {c.starts_at && <div className="text-xs">Desde {fmtDate(c.starts_at)}</div>}
                              {c.ends_at && <div className="text-xs">Hasta {fmtDate(c.ends_at)}</div>}
                            </>
                          ) : <span className="text-xs text-gray-500">Sin fechas</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{Number(c.uses)}{c.max_uses_total != null ? ` / ${c.max_uses_total}` : ''}</div>
                          {Number(c.amount_given) > 0 && <div className="text-xs text-gray-500">{money(c.amount_given)} otorgados</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${state.cls}`}>
                            <span className={`w-2 h-2 rounded-full mr-1 ${state.dot}`} />{state.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-900 p-1" title="Editar"><FiEdit className="w-4 h-4" /></button>
                            <button onClick={() => setToToggle(c)}
                              className={`p-1 ${c.status ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                              title={c.status ? 'Desactivar' : 'Activar'}>
                              {c.status ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
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
              <Pagination currentPage={page} totalPages={totalPages} totalItems={total} itemsPerPage={pageSize}
                onPageChange={(p) => load(p)}
                onItemsPerPageChange={(n) => { setPageSize(n); load(1, n); }}
                itemsPerPageOptions={[10, 20, 50, 100]} />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <DiscountCodeModal code={selected} seasons={seasons} isOpen={showModal} onClose={closeModal} mode={modalMode} onSave={() => load(modalMode === 'edit' ? page : 1)} />
      )}

      {toToggle && (
        <ConfirmationModal isOpen={!!toToggle}
          title={toToggle.status ? 'Desactivar código' : 'Activar código'}
          description={toToggle.status
            ? `¿Quieres desactivar "${toToggle.code}"? Nadie podrá usarlo hasta que lo actives otra vez.`
            : `¿Quieres activar "${toToggle.code}"? Se podrá usar si está vigente.`}
          onCancel={() => setToToggle(null)} onAccept={confirmToggle}
          cancelText="Cancelar" acceptText={toToggle.status ? 'Desactivar' : 'Activar'}
          type={toToggle.status ? 'danger' : 'info'} />
      )}
    </div>
  );
};

export default CodigosDescuento;
