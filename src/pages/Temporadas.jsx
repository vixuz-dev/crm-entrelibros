import React, { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiPlus, FiEdit, FiRefreshCw, FiXCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import SeasonInformation, { DEFAULT_TEASER } from '../components/modals/SeasonInformation';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { getStoreConfig, updateStoreConfig, getSeasons, updateSeason } from '../api/store';
import { getProducts } from '../api/products';
import { showSuccess, showError } from '../utils/notifications';

const th = 'px-6 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider';
const selectClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm bg-white disabled:opacity-60';

const badge = (text, color) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-cabin-medium ${color}`}>{text}</span>
);

/**
 * Temporadas: interruptor de venta de la tienda, temporada actual y próxima, y catálogo de temporadas.
 * Los combos no pertenecen a una temporada: la temporada solo da los textos de la vitrina y el aviso de "lo que sigue".
 */
const Temporadas = () => {
  const [config, setConfig] = useState(null); // { store_open, current_season, next_season }
  const [seasons, setSeasons] = useState([]);
  const [availableCombos, setAvailableCombos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [currentDraft, setCurrentDraft] = useState('');
  const [nextDraft, setNextDraft] = useState('');
  const [isSavingSeasons, setIsSavingSeasons] = useState(false);

  const [confirmToggle, setConfirmToggle] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [seasonToArchive, setSeasonToArchive] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSeason, setSelectedSeason] = useState(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [cfg, list] = await Promise.all([getStoreConfig(), getSeasons()]);
      setConfig(cfg);
      setSeasons(list.season_list || []);
      setCurrentDraft(cfg.current_season ? String(cfg.current_season.season_id) : '');
      setNextDraft(cfg.next_season ? String(cfg.next_season.season_id) : '');
      // Cuántos combos están a la venta (activos y con stock); es informativo, no bloquea nada
      try {
        const res = await getProducts(1, 1, '', { is_bundle: '1' });
        setAvailableCombos(res.status === true ? Number(res.TotalAvailableBooks) || 0 : 0);
      } catch {
        setAvailableCombos(null);
      }
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const storeOpen = !!config?.store_open;
  const currentId = config?.current_season ? String(config.current_season.season_id) : '';
  const nextId = config?.next_season ? String(config.next_season.season_id) : '';
  const isDirty = currentDraft !== currentId || nextDraft !== nextId;
  const sameSeason = currentDraft !== '' && currentDraft === nextDraft;
  const active = seasons.filter((s) => s.status);
  const byId = (id) => seasons.find((s) => String(s.season_id) === String(id));
  const draftCurrent = byId(currentDraft);
  const draftNext = byId(nextDraft);

  const handleToggleStore = async () => {
    setConfirmToggle(false);
    setIsToggling(true);
    try {
      await updateStoreConfig({ store_open: !storeOpen });
      showSuccess(storeOpen ? 'Venta cerrada' : 'Venta abierta');
      await load();
    } catch (error) {
      showError(error.message);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveSeasons = async () => {
    if (sameSeason) return;
    setIsSavingSeasons(true);
    try {
      const changes = {};
      if (currentDraft !== currentId) changes.current_season_id = currentDraft ? Number(currentDraft) : null;
      if (nextDraft !== nextId) changes.next_season_id = nextDraft ? Number(nextDraft) : null;
      await updateStoreConfig(changes);
      showSuccess('Temporadas actualizadas correctamente');
      await load();
    } catch (error) {
      showError(error.message);
    } finally {
      setIsSavingSeasons(false);
    }
  };

  const confirmArchive = async () => {
    if (!seasonToArchive) return;
    const target = seasonToArchive;
    setSeasonToArchive(null);
    try {
      await updateSeason({ season_id: target.season_id, status: !target.status });
      showSuccess(`Temporada ${target.status ? 'archivada' : 'activada'} correctamente`);
      await load();
    } catch (error) {
      showError(error.message);
    }
  };

  const openCreate = () => { setModalMode('create'); setSelectedSeason(null); setShowModal(true); };
  const openEdit = (season) => { setModalMode('edit'); setSelectedSeason(season); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelectedSeason(null); };

  const isInUse = (season) => String(season.season_id) === currentId || String(season.season_id) === nextId;

  if (isLoading && !config) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
        <p className="mt-4 text-gray-600 font-cabin-medium">Cargando temporadas...</p>
      </div>
    );
  }

  if (loadError && !config) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-600 font-cabin-medium">{loadError}</p>
        <button onClick={load} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-cabin-bold text-gray-800 mb-2">Temporadas</h1>
          <p className="text-sm sm:text-base text-gray-600 font-cabin-regular">
            Controla cuándo se vende en la tienda y qué temporada se muestra. Los combos no dependen de una temporada.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} title="Actualizar"
            className="p-3 border border-gray-300 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
            <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreate}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-cabin-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto">
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Nueva temporada</span>
          </button>
        </div>
      </div>

      {/* Venta de la tienda */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-cabin-semibold text-gray-800 text-lg">Venta de la tienda</h2>
            <p className="text-sm text-gray-600 font-cabin-regular mt-1">
              {storeOpen
                ? 'Abierta: el público ve los combos activos y puede comprar.'
                : 'Cerrada: el sitio muestra "Próximamente" y no se puede comprar. Los pagos ya iniciados se completan con normalidad.'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {badge(storeOpen ? 'Abierta' : 'Cerrada', storeOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}
            <button type="button" role="switch" aria-checked={storeOpen} disabled={isToggling}
              onClick={() => setConfirmToggle(true)}
              title={storeOpen ? 'Cerrar la venta' : 'Abrir la venta'}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-60 ${storeOpen ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${storeOpen ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        {storeOpen && availableCombos === 0 && (
          <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm font-cabin-regular">
            <FiAlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>La venta está abierta, pero no hay combos a la venta (activos y con stock). El público verá "Próximamente".</span>
          </div>
        )}
        {!storeOpen && availableCombos !== null && (
          <p className="mt-3 text-xs text-gray-500 font-cabin-regular">
            Combos listos para vender: <strong>{availableCombos}</strong> (activos y con stock).
          </p>
        )}
      </div>

      {/* Temporada actual y próxima */}
      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <h2 className="font-cabin-semibold text-gray-800 text-lg mb-4">Qué muestra la tienda</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="current_season" className="text-sm font-cabin-medium text-gray-600 mb-2 block">Temporada actual</label>
            <select id="current_season" value={currentDraft} disabled={isSavingSeasons} className={selectClass}
              onChange={(e) => setCurrentDraft(e.target.value)}>
              {currentDraft === '' && <option value="" disabled>Selecciona una temporada…</option>}
              {active.map((s) => <option key={s.season_id} value={s.season_id}>{s.name}</option>)}
            </select>
            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-4 min-h-[110px]">
              {draftCurrent ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-amber-700 font-cabin-medium">{draftCurrent.eyebrow}</p>
                  <p className="mt-1 font-cabin-semibold text-gray-800">{draftCurrent.title}</p>
                  <p className="mt-1 text-sm text-gray-600 font-cabin-regular">{draftCurrent.description}</p>
                </>
              ) : <p className="text-sm text-gray-400 font-cabin-regular">Sin temporada actual.</p>}
            </div>
          </div>

          <div>
            <label htmlFor="next_season" className="text-sm font-cabin-medium text-gray-600 mb-2 block">Próxima temporada</label>
            <select id="next_season" value={nextDraft} disabled={isSavingSeasons} className={selectClass}
              onChange={(e) => setNextDraft(e.target.value)}>
              <option value="">Sin definir</option>
              {active.map((s) => <option key={s.season_id} value={s.season_id}>{s.name}</option>)}
            </select>
            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-4 min-h-[110px]">
              {draftNext ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-amber-700 font-cabin-medium">Lo que sigue</p>
                  <p className="mt-1 font-cabin-semibold text-gray-800">Próxima temporada: {draftNext.name}</p>
                  <p className="mt-1 text-sm text-gray-600 font-cabin-regular">{draftNext.teaser?.trim() || DEFAULT_TEASER}</p>
                </>
              ) : <p className="text-sm text-gray-400 font-cabin-regular">No se mostrará aviso de próxima temporada.</p>}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          {sameSeason && <p className="text-sm text-red-600 font-cabin-regular sm:mr-auto">La temporada actual y la próxima deben ser distintas.</p>}
          {isDirty && !sameSeason && <p className="text-sm text-amber-700 font-cabin-regular sm:mr-auto">Tienes cambios sin guardar.</p>}
          <button type="button" disabled={!isDirty || isSavingSeasons}
            onClick={() => { setCurrentDraft(currentId); setNextDraft(nextId); }}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-cabin-medium hover:bg-gray-50 transition-colors disabled:opacity-40">
            Descartar
          </button>
          <button type="button" disabled={!isDirty || sameSeason || isSavingSeasons || currentDraft === ''} onClick={handleSaveSeasons}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-cabin-medium transition-colors disabled:opacity-40 flex items-center justify-center space-x-2">
            {isSavingSeasons && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>

      {/* Catálogo */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-cabin-semibold text-gray-800 text-lg">Catálogo de temporadas</h2>
          <p className="text-sm text-gray-600 font-cabin-regular">Las temporadas archivadas no se pueden elegir como actual ni próxima.</p>
        </div>
        {seasons.length === 0 ? (
          <div className="p-10 text-center">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-cabin-semibold">Aún no hay temporadas</p>
            <button onClick={openCreate} className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-cabin-medium">Crear la primera temporada</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className={th}>Temporada</th>
                  <th className={th}>Título</th>
                  <th className={th}>Estado</th>
                  <th className={th}>Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seasons.map((season) => {
                  const isCurrent = String(season.season_id) === currentId;
                  const isNext = String(season.season_id) === nextId;
                  return (
                    <tr key={season.season_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-cabin-semibold text-gray-900">{season.name}</div>
                        <div className="text-xs font-mono text-gray-500">{season.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                        <div className="truncate" title={season.title}>{season.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1.5">
                          {badge(season.status ? 'Disponible' : 'Archivada', season.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}
                          {isCurrent && badge('Actual', 'bg-amber-100 text-amber-800')}
                          {isNext && badge('Próxima', 'bg-blue-100 text-blue-800')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => openEdit(season)} className="text-blue-600 hover:text-blue-900 p-1" title="Editar"><FiEdit className="w-4 h-4" /></button>
                          <button onClick={() => setSeasonToArchive(season)} disabled={season.status && isInUse(season)}
                            className={`p-1 disabled:opacity-30 disabled:cursor-not-allowed ${season.status ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={season.status ? (isInUse(season) ? 'Es la actual o la próxima: cámbiala primero' : 'Archivar') : 'Activar'}>
                            {season.status ? <FiXCircle className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SeasonInformation season={selectedSeason} isOpen={showModal} onClose={closeModal} mode={modalMode} onSave={load} />

      {confirmToggle && (
        <ConfirmationModal isOpen={confirmToggle}
          title={storeOpen ? 'Cerrar la venta' : 'Abrir la venta'}
          description={storeOpen
            ? 'El sitio dejará de mostrar los combos y no se podrán crear pedidos nuevos. Los pagos ya iniciados se completan con normalidad.'
            : `El público verá los combos activos con stock y podrá comprar${config?.current_season ? ` (temporada: ${config.current_season.name})` : ''}.`}
          onCancel={() => setConfirmToggle(false)} onAccept={handleToggleStore}
          cancelText="Cancelar" acceptText={storeOpen ? 'Cerrar venta' : 'Abrir venta'}
          type={storeOpen ? 'danger' : 'info'} />
      )}

      {seasonToArchive && (
        <ConfirmationModal isOpen={!!seasonToArchive}
          title={seasonToArchive.status ? 'Archivar temporada' : 'Activar temporada'}
          description={seasonToArchive.status
            ? `¿Archivar "${seasonToArchive.name}"? No se podrá elegir como actual ni próxima hasta que la actives de nuevo.`
            : `¿Activar "${seasonToArchive.name}"? Podrás elegirla como actual o próxima.`}
          onCancel={() => setSeasonToArchive(null)} onAccept={confirmArchive}
          cancelText="Cancelar" acceptText={seasonToArchive.status ? 'Archivar' : 'Activar'}
          type={seasonToArchive.status ? 'danger' : 'info'} />
      )}
    </div>
  );
};

export default Temporadas;
