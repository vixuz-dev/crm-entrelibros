import React, { useEffect, useState } from 'react';
import { FiSearch, FiPlus, FiX, FiArrowUp, FiArrowDown, FiCheck } from 'react-icons/fi';
import { getProducts } from '../../api/products';
import { useDebounce } from '../../hooks/useDebounce';
import placeholderImage from '../../assets/images/placeholder.jpg';

export const MAX_BOOKS_PER_COMBO = 8;

const isCombo = (p) => Array.isArray(p?.bundle_items) && p.bundle_items.length > 0;

/**
 * Selector de los libros de un combo. Los libros salen de la BIBLIOTECA (productos que no son combos);
 * la portada y el título vienen del propio libro. Un libro aparece una sola vez por combo.
 *
 * selected: [{ product_id, title, cover_url }]  (el orden de la lista es el orden de las portadas)
 */
const BookPicker = ({ selected, onChange, disabled = false, max = MAX_BOOKS_PER_COMBO }) => {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebounce(term, 400);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (disabled) return undefined;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getProducts(1, 8, debouncedTerm, { is_bundle: '0' });
        if (cancelled) return;
        const list = response.status === true ? response.product_list || [] : [];
        setResults(
          list
            .filter((p) => !isCombo(p)) // respaldo si el backend aún no filtra por is_bundle
            .map((p) => ({
              product_id: p.product_id,
              title: p.product_name,
              cover_url: (p.main_image_url || '').trim(),
              authors: (p.author_list || []).map((a) => a.author_name).join(', '),
            }))
        );
      } catch (e) {
        if (!cancelled) setError('No se pudo cargar la biblioteca.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedTerm, disabled]);

  const selectedIds = new Set(selected.map((b) => b.product_id));
  const isFull = selected.length >= max;

  const add = (book) => {
    if (isFull || selectedIds.has(book.product_id) || !book.cover_url) return;
    onChange([...selected, { product_id: book.product_id, title: book.title, cover_url: book.cover_url }]);
  };
  const remove = (id) => onChange(selected.filter((b) => b.product_id !== id));
  const move = (index, delta) => {
    const next = [...selected];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Libros ya elegidos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-cabin-semibold text-gray-800">Libros del combo</h4>
          <span className={`text-xs font-cabin-medium ${isFull ? 'text-amber-700' : 'text-gray-500'}`}>
            {selected.length} de {max}
          </span>
        </div>

        {selected.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Aún no hay libros en este combo. {disabled ? '' : 'Búscalos abajo y agrégalos.'}
          </div>
        ) : (
          <ul className="space-y-2">
            {selected.map((book, index) => (
              <li key={book.product_id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <span className="w-5 text-center text-xs font-cabin-semibold text-gray-400">{index + 1}</span>
                <img
                  src={book.cover_url || placeholderImage}
                  alt={book.title}
                  className="h-14 w-10 flex-shrink-0 rounded object-cover shadow-sm"
                  onError={(e) => { e.target.src = placeholderImage; }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-cabin-medium text-gray-800">{book.title}</span>
                {!disabled && (
                  <div className="flex items-center">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30" title="Subir">
                      <FiArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30" title="Bajar">
                      <FiArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(book.product_id)}
                      className="p-1.5 text-red-400 hover:text-red-600" title="Quitar del combo">
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Búsqueda en la biblioteca */}
      {!disabled && (
        <div>
          <h4 className="mb-2 text-sm font-cabin-semibold text-gray-800">Agregar libros de la biblioteca</h4>
          <div className="relative mb-2">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar libro por título…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm font-cabin-regular focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">Buscando…</p>
            ) : error ? (
              <p className="px-4 py-6 text-center text-sm text-red-600">{error}</p>
            ) : results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                {debouncedTerm ? 'No hay libros con ese título.' : 'La biblioteca está vacía. Primero da de alta los libros en la sección Libros.'}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.map((book) => {
                  const already = selectedIds.has(book.product_id);
                  const noCover = !book.cover_url;
                  const blocked = already || noCover || isFull;
                  return (
                    <li key={book.product_id} className="flex items-center gap-3 px-3 py-2">
                      <img
                        src={book.cover_url || placeholderImage}
                        alt={book.title}
                        className="h-12 w-9 flex-shrink-0 rounded object-cover shadow-sm"
                        onError={(e) => { e.target.src = placeholderImage; }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-cabin-medium text-gray-800">{book.title}</p>
                        <p className="truncate text-xs text-gray-500">{book.authors || 'Sin autor'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => add(book)}
                        disabled={blocked}
                        title={noCover ? 'Este libro no tiene portada; agrégasela en la sección Libros' : undefined}
                        className={`flex flex-shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-cabin-medium transition-colors ${
                          blocked ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                      >
                        {already ? (<><FiCheck className="h-3.5 w-3.5" /> Agregado</>)
                          : noCover ? 'Sin portada'
                          : (<><FiPlus className="h-3.5 w-3.5" /> Agregar</>)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookPicker;
