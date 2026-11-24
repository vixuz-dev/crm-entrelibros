import React, { useState, useEffect } from 'react';
import { FiX, FiTag, FiCopy, FiDownload, FiCheck } from 'react-icons/fi';
import { createDiscountCodes, updateDiscountCode } from '../../api/discounts';
import { showSuccess, showError } from '../../utils/notifications';

const TYPES = [
  { value: 'PERCENT', label: 'Porcentaje', hint: 'Ej. 10 % sobre el subtotal' },
  { value: 'FIXED', label: 'Monto fijo', hint: 'Ej. $100 de descuento' },
  { value: 'FREE_SHIPPING', label: 'Envío gratis', hint: 'El envío queda en $0' },
];
const SOURCES = [
  { value: 'single', label: 'Un código' },
  { value: 'batch', label: 'Lote' },
  { value: 'personal', label: 'Personales por correo' },
];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const EMPTY = {
  source: 'single', code: '', prefix: '', quantity: '10', emails: '', batch_label: '',
  type: 'PERCENT', value: '', max_discount: '', min_subtotal: '', starts_at: '', ends_at: '',
  max_uses_total: '', season_id: '', description: '',
};

// "2026-12-31 23:59:00" (base de datos) → "2026-12-31T23:59" (input datetime-local)
const toInput = (v) => (v ? String(v).replace(' ', 'T').slice(0, 16) : '');

const input = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular text-sm disabled:bg-gray-100';
const label = 'block text-sm font-cabin-semibold text-gray-700 mb-1';

/** Crear códigos (uno, lote o personales) o editar uno existente. mode: 'create' | 'edit'. */
const DiscountCodeModal = ({ code, seasons = [], isOpen, onClose, mode = 'create', onSave }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [created, setCreated] = useState(null); // resultado de una creación, para copiar/descargar
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setCreated(null);
    setCopied(false);
    if (isEdit && code) {
      setForm({
        ...EMPTY,
        code: code.code, type: code.type, value: code.value ?? '', description: code.description || '',
        max_discount: code.max_discount ?? '', min_subtotal: code.min_subtotal ?? '',
        starts_at: toInput(code.starts_at), ends_at: toInput(code.ends_at),
        max_uses_total: code.max_uses_total ?? '', season_id: code.season_id ?? '',
        batch_label: code.batch_label || '', emails: code.assigned_email || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [isOpen, isEdit, code]);

  if (!isOpen) return null;

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const emailList = form.emails.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);

  const validate = () => {
    const e = {};
    if (!isEdit) {
      if (form.source === 'single') {
        const c = form.code.trim().toUpperCase().replace(/\s+/g, '');
        if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(c)) e.code = 'De 3 a 40 caracteres: letras, números, guion o guion bajo.';
      }
      if (form.source === 'batch') {
        const q = Number(form.quantity);
        if (!Number.isInteger(q) || q < 1 || q > 500) e.quantity = 'Entre 1 y 500.';
      }
      if (form.source !== 'single' && form.prefix && !/^[A-Za-z0-9]{1,12}$/.test(form.prefix)) {
        e.prefix = 'Solo letras y números (máx. 12).';
      }
      if (form.source === 'personal') {
        if (!emailList.length) e.emails = 'Pega al menos un correo.';
        else if (emailList.length > 500) e.emails = 'Máximo 500 correos por lote.';
        else if (emailList.some((m) => !EMAIL_RE.test(m))) e.emails = `Correo no válido: ${emailList.find((m) => !EMAIL_RE.test(m))}`;
        else if (new Set(emailList).size !== emailList.length) e.emails = 'Hay correos repetidos.';
      }
      if (form.type !== 'FREE_SHIPPING') {
        const v = Number(form.value);
        if (!(v > 0)) e.value = 'Debe ser mayor a 0.';
        else if (form.type === 'PERCENT' && v > 100) e.value = 'Un porcentaje no puede pasar de 100.';
      }
    }
    for (const f of ['max_discount', 'min_subtotal']) {
      if (form[f] !== '' && !(Number(form[f]) > 0)) e[f] = 'Debe ser mayor a 0.';
    }
    if (form.max_uses_total !== '' && !(Number.isInteger(Number(form.max_uses_total)) && Number(form.max_uses_total) >= 1)) {
      e.max_uses_total = 'Número entero, mínimo 1.';
    }
    if (form.starts_at && form.ends_at && form.starts_at >= form.ends_at) e.ends_at = 'Debe ser posterior al inicio.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const rules = {
        description: form.description.trim(),
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        max_uses_total: form.max_uses_total === '' ? null : Number(form.max_uses_total),
        min_subtotal: form.min_subtotal === '' ? null : Number(form.min_subtotal),
        season_id: form.season_id === '' ? null : Number(form.season_id),
      };
      if (form.type === 'PERCENT') rules.max_discount = form.max_discount === '' ? null : Number(form.max_discount);

      if (isEdit) {
        await updateDiscountCode({ code_id: code.code_id, ...rules, batch_label: form.batch_label.trim() });
        showSuccess('Código actualizado');
        onSave?.();
        onClose();
        return;
      }

      const payload = { ...rules, type: form.type, batch_label: form.batch_label.trim() || undefined };
      if (form.type !== 'FREE_SHIPPING') payload.value = Number(form.value);
      if (form.source === 'single') payload.code = form.code.trim().toUpperCase().replace(/\s+/g, '');
      if (form.source === 'batch') { payload.quantity = Number(form.quantity); payload.prefix = form.prefix.trim().toUpperCase(); }
      if (form.source === 'personal') { payload.assigned_emails = emailList; payload.prefix = form.prefix.trim().toUpperCase(); }

      const response = await createDiscountCodes(payload);
      showSuccess(response.status_Message || 'Códigos creados');
      onSave?.();
      if (form.source === 'single') onClose();
      else setCreated(response.codes || []); // lote o personales: se muestran para copiarlos
    } catch (e) {
      showError(e.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const codesText = (created || []).map((c) => (c.assigned_email ? `${c.code}\t${c.assigned_email}` : c.code)).join('\n');
  const copyAll = async () => {
    try { await navigator.clipboard.writeText(codesText); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { showError('No se pudo copiar. Selecciona el texto y cópialo a mano.'); }
  };
  const downloadCsv = () => {
    const rows = ['codigo,correo', ...(created || []).map((c) => `${c.code},${c.assigned_email || ''}`)];
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `codigos-${form.batch_label.trim() || 'descuento'}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const err = (f) => errors[f] && <p className="mt-1 text-xs text-red-600 font-cabin-regular">{errors[f]}</p>;
  const typeLocked = isEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><FiTag className="w-5 h-5 text-amber-600" /></div>
            <div>
              <h2 className="text-xl font-cabin-bold text-gray-800">
                {created ? 'Códigos creados' : isEdit ? `Editar ${code?.code}` : 'Nuevos códigos de descuento'}
              </h2>
              <p className="text-xs text-gray-500 font-cabin-regular">
                {isEdit ? 'El código, el tipo y el valor no se pueden cambiar: crea otro si hace falta.' : 'Cada persona puede usar un código una sola vez.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><FiX className="w-5 h-5" /></button>
        </div>

        {created ? (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-700 font-cabin-regular">
              Se crearon <strong>{created.length}</strong> código(s). Guárdalos ahora: también los verás en el listado.
            </p>
            <textarea readOnly value={codesText} rows={Math.min(Math.max(created.length, 4), 12)}
              className={`${input} font-mono`} onFocus={(e) => e.target.select()} />
            <div className="flex flex-wrap justify-end gap-3">
              <button onClick={copyAll} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-cabin-medium hover:bg-gray-50 flex items-center space-x-2">
                {copied ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4" />}<span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button onClick={downloadCsv} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-cabin-medium hover:bg-gray-50 flex items-center space-x-2">
                <FiDownload className="w-4 h-4" /><span>Descargar CSV</span>
              </button>
              <button onClick={onClose} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-cabin-medium">Listo</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
            {!isEdit && (
              <div>
                <span className={label}>¿Qué quieres crear?</span>
                <div className="grid grid-cols-3 gap-2">
                  {SOURCES.map((s) => (
                    <button key={s.value} type="button" onClick={() => setField('source', s.value)}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-cabin-medium transition-colors ${form.source === s.value ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isEdit && form.source === 'single' && (
              <div>
                <label className={label} htmlFor="dc_code">Código</label>
                <input id="dc_code" className={`${input} uppercase`} placeholder="NAVIDAD10" value={form.code} disabled={isSaving}
                  onChange={(e) => setField('code', e.target.value.toUpperCase())} maxLength={40} />
                {err('code')}
              </div>
            )}
            {!isEdit && form.source !== 'single' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.source === 'batch' && (
                  <div>
                    <label className={label} htmlFor="dc_qty">Cantidad</label>
                    <input id="dc_qty" type="number" min="1" max="500" className={input} value={form.quantity} disabled={isSaving}
                      onChange={(e) => setField('quantity', e.target.value)} />
                    {err('quantity')}
                  </div>
                )}
                <div>
                  <label className={label} htmlFor="dc_prefix">Prefijo (opcional)</label>
                  <input id="dc_prefix" className={`${input} uppercase`} placeholder="NAV" value={form.prefix} disabled={isSaving}
                    onChange={(e) => setField('prefix', e.target.value.toUpperCase())} maxLength={12} />
                  {err('prefix')}
                </div>
              </div>
            )}
            {!isEdit && form.source === 'personal' && (
              <div>
                <label className={label} htmlFor="dc_emails">Correos ({emailList.length})</label>
                <textarea id="dc_emails" rows={4} className={input} placeholder="uno@correo.com, otro@correo.com (uno por línea o separados por coma)"
                  value={form.emails} disabled={isSaving} onChange={(e) => setField('emails', e.target.value)} />
                <p className="mt-1 text-xs text-gray-500">Se crea un código distinto por correo y solo ese correo puede usarlo, una vez.</p>
                {err('emails')}
              </div>
            )}

            <div>
              <span className={label}>Tipo de descuento</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button key={t.value} type="button" disabled={typeLocked || isSaving} onClick={() => setField('type', t.value)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-colors disabled:cursor-not-allowed ${form.type === t.value ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:bg-gray-50'} ${typeLocked && form.type !== t.value ? 'opacity-40' : ''}`}>
                    <div className="text-sm font-cabin-semibold text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {form.type !== 'FREE_SHIPPING' && (
                <div>
                  <label className={label} htmlFor="dc_value">{form.type === 'PERCENT' ? 'Porcentaje (%)' : 'Monto (MXN)'}</label>
                  <input id="dc_value" type="number" step="0.01" min="0" className={input} value={form.value} disabled={isSaving || typeLocked}
                    onChange={(e) => setField('value', e.target.value)} placeholder={form.type === 'PERCENT' ? '10' : '100'} />
                  {err('value')}
                </div>
              )}
              {form.type === 'PERCENT' && (
                <div>
                  <label className={label} htmlFor="dc_max">Tope del descuento (MXN, opcional)</label>
                  <input id="dc_max" type="number" step="0.01" min="0" className={input} value={form.max_discount} disabled={isSaving}
                    onChange={(e) => setField('max_discount', e.target.value)} placeholder="Sin tope" />
                  {err('max_discount')}
                </div>
              )}
              <div>
                <label className={label} htmlFor="dc_min">Compra mínima (MXN, opcional)</label>
                <input id="dc_min" type="number" step="0.01" min="0" className={input} value={form.min_subtotal} disabled={isSaving}
                  onChange={(e) => setField('min_subtotal', e.target.value)} placeholder="Sin mínimo" />
                {err('min_subtotal')}
              </div>
              <div>
                <label className={label} htmlFor="dc_uses">Usos totales (opcional)</label>
                <input id="dc_uses" type="number" min="1" className={input} value={form.max_uses_total} disabled={isSaving}
                  onChange={(e) => setField('max_uses_total', e.target.value)} placeholder="Ilimitados" />
                {err('max_uses_total')}
              </div>
              <div>
                <label className={label} htmlFor="dc_start">Vigente desde (opcional)</label>
                <input id="dc_start" type="datetime-local" className={input} value={form.starts_at} disabled={isSaving}
                  onChange={(e) => setField('starts_at', e.target.value)} />
              </div>
              <div>
                <label className={label} htmlFor="dc_end">Vigente hasta (opcional)</label>
                <input id="dc_end" type="datetime-local" className={input} value={form.ends_at} disabled={isSaving}
                  onChange={(e) => setField('ends_at', e.target.value)} />
                {err('ends_at')}
              </div>
              <div>
                <label className={label} htmlFor="dc_season">Temporada (opcional)</label>
                <select id="dc_season" className={input} value={form.season_id} disabled={isSaving} onChange={(e) => setField('season_id', e.target.value)}>
                  <option value="">Ninguna</option>
                  {seasons.map((s) => <option key={s.season_id} value={s.season_id}>{s.name}</option>)}
                </select>
              </div>
              {(isEdit || form.source !== 'single') && (
                <div>
                  <label className={label} htmlFor="dc_batch">Nombre del lote (opcional)</label>
                  <input id="dc_batch" className={input} value={form.batch_label} disabled={isSaving} maxLength={60}
                    onChange={(e) => setField('batch_label', e.target.value)} placeholder="navidad-2026" />
                </div>
              )}
            </div>

            <div>
              <label className={label} htmlFor="dc_desc">Descripción interna (opcional)</label>
              <input id="dc_desc" className={input} value={form.description} disabled={isSaving} maxLength={150}
                onChange={(e) => setField('description', e.target.value)} placeholder="Solo la ves tú, p. ej. «Cupón de bienvenida»" />
            </div>

            <p className="text-xs text-gray-500 font-cabin-regular bg-amber-50 border border-amber-100 rounded-lg p-3">
              El descuento se calcula sobre el subtotal de los combos, nunca sobre el envío (salvo «Envío gratis»).
              Siempre queda al menos $10 por pagar.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} disabled={isSaving}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-cabin-medium hover:bg-gray-50 transition-colors disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={isSaving}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-cabin-medium transition-colors disabled:opacity-50 flex items-center space-x-2">
                {isSaving && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                <span>{isEdit ? 'Guardar cambios' : form.source === 'single' ? 'Crear código' : 'Generar códigos'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DiscountCodeModal;
