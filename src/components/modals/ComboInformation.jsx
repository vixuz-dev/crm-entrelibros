import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiPackage, FiEdit, FiUpload } from 'react-icons/fi';
import BookPicker, { MAX_BOOKS_PER_COMBO } from '../combos/BookPicker';
import { convertImageToWebpGetUrl, addProduct, updateProduct } from '../../api/products';
import { showSuccess, showError } from '../../utils/notifications';
import placeholderImage from '../../assets/images/placeholder.jpg';

const EMPTY = { product_name: '', product_description: '', price: '', price_offer: '', stock: '', status: 1, main_image_url: '' };

const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

/**
 * Crear / ver / editar un COMBO. Un combo es un producto a la venta que agrupa libros de la biblioteca.
 * - Tiene su PROPIA imagen (no se reutiliza la portada de un libro: al cambiar la imagen de un producto,
 *   el backend borra el archivo anterior de S3 y se llevaría la portada del libro).
 * - Autor, categoría y tema no aplican: se envían vacíos.
 */
const ComboInformation = ({ combo, isOpen, onClose, mode = 'view', onSave, isLoadingDetail = false }) => {
  const [form, setForm] = useState(EMPTY);
  const [books, setBooks] = useState([]);
  const [pendingImage, setPendingImage] = useState(null); // { file, preview }
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInput = useRef(null);

  // Cargar datos al abrir
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'create' || !combo) {
      setForm(EMPTY);
      setBooks([]);
    } else {
      const price = Number(combo.price) || 0;
      const offer = Number(combo.price_offer) || 0;
      setForm({
        product_name: combo.product_name || '',
        product_description: combo.product_description === 'Sin descripcion' ? '' : combo.product_description || '',
        price: price || '',
        price_offer: offer > 0 && offer < price ? offer : '',
        stock: combo.stock ?? '',
        status: combo.status ? 1 : 0,
        main_image_url: combo.main_image_url || '',
      });
      setBooks((combo.bundle_items || []).map((b) => ({ product_id: b.product_id, title: b.title, cover_url: b.cover_url })));
    }
    setPendingImage(null);
    setIsEditMode(mode === 'create' || mode === 'edit');
  }, [isOpen, combo, mode]);

  useEffect(() => () => { if (pendingImage?.preview) URL.revokeObjectURL(pendingImage.preview); }, [pendingImage]);

  if (!isOpen) return null;

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const price = Number(form.price) || 0;
  const offer = Number(form.price_offer) || 0;
  const hasDiscount = offer > 0 && offer < price;
  const discountPct = hasDiscount ? Math.round((1 - offer / price) * 100) : 0;

  const pickImage = (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      showError('Formato de imagen no válido. Solo se permiten PNG, JPEG, JPG y WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }
    setPendingImage({ file, preview: URL.createObjectURL(file) });
  };

  const uploadImage = async (file) => {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const response = await convertImageToWebpGetUrl(base64, file.name.split('.').pop().toLowerCase(), true);
    if (response.status !== true) throw new Error(response.status_Message || 'Error al subir la imagen');
    return response.image_url;
  };

  const handleSave = async () => {
    if (!form.product_name.trim()) return showError('El nombre del combo es requerido');
    if (!pendingImage && !form.main_image_url) return showError('Debes subir la imagen del combo');
    if (!(price > 0)) return showError('El precio debe ser mayor a 0');
    if (form.price_offer !== '' && offer > 0 && offer >= price) return showError('El precio con descuento debe ser menor al precio');
    if (form.stock === '' || Number(form.stock) < 0) return showError('Indica el stock (0 o más)');
    if (books.length < 1) return showError('El combo necesita al menos un libro');
    if (books.length > MAX_BOOKS_PER_COMBO) return showError(`Un combo puede tener hasta ${MAX_BOOKS_PER_COMBO} libros`);

    try {
      setIsSaving(true);
      const mainImageUrl = pendingImage ? await uploadImage(pendingImage.file) : form.main_image_url;

      const payload = {
        product_name: form.product_name.trim(),
        product_description: form.product_description.trim() || 'Sin descripcion',
        price,
        // La tienda solo muestra productos con price_offer > 0: sin descuento, el precio final es el precio.
        price_offer: hasDiscount ? offer : price,
        stock: parseInt(form.stock, 10) || 0,
        amount_pages: 0,
        status: form.status ? 1 : 0,
        author_id_list: [],
        category_id_list: [],
        topic_id_list: [],
        main_image_url: mainImageUrl,
        secondary_image_url_list: [],
        bundle_product_ids: books.map((b) => b.product_id), // el orden es el de las portadas
      };

      let response;
      if (combo?.product_id && mode !== 'create') {
        response = await updateProduct({ ...payload, product_type: 'FISICO', product_id: combo.product_id });
      } else {
        response = await addProduct({ ...payload, product_type: 'FISICO' });
      }

      if (response.status === true) {
        showSuccess(combo?.product_id && mode !== 'create' ? 'Combo actualizado correctamente' : 'Combo creado correctamente');
        onSave?.(response);
        onClose();
      } else {
        showError(response.status_Message || 'No se pudo guardar el combo');
      }
    } catch (error) {
      console.error('Error saving combo:', error);
      showError(error.response?.data?.status_Message || error.message || 'Error al guardar el combo');
    } finally {
      setIsSaving(false);
    }
  };

  const title = mode === 'create' ? 'Crear Nuevo Combo' : isEditMode ? 'Editar Combo' : 'Detalle del Combo';
  const subtitle = mode === 'create'
    ? 'Un combo agrupa libros de la biblioteca y es lo que se vende'
    : combo?.product_name || '';
  const imageSrc = pendingImage?.preview || form.main_image_url || '';
  const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-cabin-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500';
  const labelClass = 'mb-1 block text-sm font-cabin-medium text-gray-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="flex max-h-[90dvh] w-full max-w-xs flex-col rounded-lg bg-white shadow-2xl sm:max-w-lg sm:rounded-xl md:max-w-2xl lg:max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
          <div className="flex min-w-0 flex-1 items-center space-x-3 sm:space-x-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-12 sm:w-12">
              <FiPackage className="h-5 w-5 text-amber-600 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-cabin-bold text-gray-800 sm:text-xl">{title}</h2>
              <p className="truncate text-xs text-gray-600 sm:text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center space-x-1 sm:space-x-2">
            {!isEditMode && mode !== 'create' && (
              <button onClick={() => setIsEditMode(true)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600" title="Editar">
                <FiEdit className="h-5 w-5" />
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {isLoadingDetail ? (
            <div className="flex h-32 items-center justify-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-amber-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                {/* Imagen del combo */}
                <div className="w-full flex-shrink-0 lg:w-64">
                  <span className={labelClass}>Imagen del combo</span>
                  <div
                    onClick={() => isEditMode && fileInput.current?.click()}
                    onDragOver={(e) => isEditMode && e.preventDefault()}
                    onDrop={(e) => { if (!isEditMode) return; e.preventDefault(); pickImage(e.dataTransfer.files?.[0]); }}
                    className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed ${
                      imageSrc ? 'border-transparent' : 'border-gray-300'
                    } ${isEditMode ? 'cursor-pointer hover:border-amber-400' : ''}`}
                  >
                    {imageSrc ? (
                      <img src={imageSrc} alt="Imagen del combo" className="h-full w-full object-cover" onError={(e) => { e.target.src = placeholderImage; }} />
                    ) : (
                      <div className="px-3 text-center text-sm text-gray-500">
                        <FiUpload className="mx-auto mb-2 h-7 w-7 text-gray-400" />
                        Subir imagen del combo
                        <p className="mt-1 text-xs">PNG, JPEG, JPG o WebP · máx. 5MB</p>
                      </div>
                    )}
                  </div>
                  {isEditMode && (
                    <>
                      <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden"
                        onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ''; }} />
                      {imageSrc && (
                        <button type="button" onClick={() => fileInput.current?.click()} className="mt-2 text-xs font-cabin-medium text-amber-700 hover:text-amber-800">
                          Cambiar imagen
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Datos del combo */}
                <div className="w-full flex-1 space-y-4">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className={labelClass}>Nombre del combo</label>
                        <input type="text" value={form.product_name} onChange={(e) => set('product_name', e.target.value)}
                          placeholder="Ej. Combo Navidad en Familia" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Descripción</label>
                        <textarea rows={3} value={form.product_description} onChange={(e) => set('product_description', e.target.value)}
                          placeholder="Qué lo hace especial…" className={`${inputClass} resize-none`} />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className={labelClass}>Precio</label>
                          <input type="number" min="1" step="1" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="749" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Precio con descuento <span className="text-gray-400">(opcional)</span></label>
                          <input type="number" min="1" step="1" value={form.price_offer} onChange={(e) => set('price_offer', e.target.value)}
                            placeholder="Igual al precio" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Stock</label>
                          <input type="number" min="0" step="1" value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="20" className={inputClass} />
                        </div>
                      </div>
                      {hasDiscount && (
                        <p className="text-xs font-cabin-medium text-green-700">
                          Descuento de {discountPct}%: se venderá en {money(offer)} (antes {money(price)}).
                        </p>
                      )}
                      <div className="sm:w-1/2">
                        <label className={labelClass}>Estado</label>
                        <select value={form.status} onChange={(e) => set('status', Number(e.target.value))} className={inputClass}>
                          <option value={1}>Activo (visible en la tienda)</option>
                          <option value={0}>Inactivo (oculto)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Para verse en la tienda debe estar activo y con stock mayor a 0.</p>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
                      <div className="col-span-2">
                        <span className="block font-cabin-medium text-gray-600">Nombre</span>
                        <span className="text-base font-cabin-semibold">{form.product_name}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block font-cabin-medium text-gray-600">Descripción</span>
                        <span className="font-cabin-regular">{form.product_description || '—'}</span>
                      </div>
                      <div>
                        <span className="block font-cabin-medium text-gray-600">Precio</span>
                        <span className="font-cabin-medium">
                          {hasDiscount ? (<><span className="text-green-700">{money(offer)}</span> <span className="text-gray-400 line-through">{money(price)}</span></>) : money(price)}
                        </span>
                      </div>
                      <div>
                        <span className="block font-cabin-medium text-gray-600">Stock</span>
                        <span className="font-cabin-medium">{form.stock || 0} unidades</span>
                      </div>
                      <div>
                        <span className="block font-cabin-medium text-gray-600">Estado</span>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${form.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {form.status ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Libros del combo */}
              <BookPicker selected={books} onChange={setBooks} disabled={!isEditMode} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 flex-col items-stretch justify-end space-y-2 rounded-b-lg border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0 sm:rounded-b-xl sm:p-6">
          <button onClick={onClose} className="w-full rounded-lg px-4 py-2 text-sm font-cabin-medium text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 sm:w-auto sm:px-6 sm:text-base">
            {isEditMode ? 'Cancelar' : 'Cerrar'}
          </button>
          {isEditMode && (
            <button onClick={handleSave} disabled={isSaving}
              className={`w-full rounded-lg px-4 py-2 text-sm font-cabin-medium transition-colors sm:w-auto sm:px-6 sm:text-base ${
                isSaving ? 'cursor-not-allowed bg-gray-400 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}>
              {isSaving ? (pendingImage ? 'Subiendo imagen y guardando…' : 'Guardando…') : mode === 'create' ? 'Crear Combo' : 'Guardar Cambios'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComboInformation;
