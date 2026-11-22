import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar } from 'react-icons/fi';
import { addSeason, updateSeason } from '../../api/store';
import { showSuccess, showError } from '../../utils/notifications';

// Mismos límites que valida el servidor (add_season / update_season)
const LIMITS = { name: 60, eyebrow: 80, title: 150, description: 500, teaser: 500 };
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const slugify = (text) =>
  text
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 40);

// Aviso general de "lo que sigue": valor inicial de toda temporada nueva (la tienda también lo usa si el aviso queda vacío)
export const DEFAULT_TEASER =
  'Estamos preparando una nueva colección con historias para compartir. Muy pronto te contaremos los detalles.';

const EMPTY = { slug: '', name: '', eyebrow: '', title: '', description: '', teaser: DEFAULT_TEASER };

/** Crear o editar una temporada. mode: 'create' | 'edit'. */
const SeasonInformation = ({ season, isOpen, onClose, mode = 'create', onSave }) => {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSlugTouched(false);
    setForm(isEdit && season ? {
      slug: season.slug, name: season.name, eyebrow: season.eyebrow,
      title: season.title, description: season.description, teaser: season.teaser || '',
    } : EMPTY);
  }, [isOpen, isEdit, season]);

  if (!isOpen) return null;

  const setField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Al crear, el slug se sugiere desde el nombre mientras no se haya tocado a mano
      if (!isEdit && field === 'name' && !slugTouched) next.slug = slugify(value);
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    for (const [field, max] of Object.entries(LIMITS)) {
      const value = form[field].trim();
      if (field !== 'teaser' && !value) e[field] = 'Este campo es obligatorio.';
      else if (value.length > max) e[field] = `Máximo ${max} caracteres.`;
    }
    if (!isEdit) {
      const slug = form.slug.trim();
      if (!slug) e.slug = 'Este campo es obligatorio.';
      else if (slug.length < 2 || slug.length > 40 || !SLUG_RE.test(slug)) {
        e.slug = 'De 2 a 40 caracteres: minúsculas, números y guiones (ej. dia-del-nino).';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const texts = {
        name: form.name.trim(), eyebrow: form.eyebrow.trim(), title: form.title.trim(),
        description: form.description.trim(), teaser: form.teaser.trim(),
      };
      if (isEdit) {
        await updateSeason({ season_id: season.season_id, ...texts });
        showSuccess('Temporada actualizada correctamente');
      } else {
        await addSeason({ slug: form.slug.trim(), ...texts });
        showSuccess('Temporada creada correctamente');
      }
      onSave?.();
      onClose();
    } catch (error) {
      showError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const input = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular transition-colors ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`;
  const label = 'text-sm font-cabin-medium text-gray-600 mb-2 block';

  // Función de render (no componente): así los inputs no se remontan y conservan el foco al escribir
  const renderField = ({ field, title, hint, multiline = false, required = true, disabled = false, mono = false }) => (
    <div>
      <label htmlFor={`season_${field}`} className={label}>
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea id={`season_${field}`} rows={3} value={form[field]} disabled={isSaving}
          onChange={(e) => setField(field, e.target.value)} className={input(field)} />
      ) : (
        <input id={`season_${field}`} type="text" value={form[field]} disabled={isSaving || disabled}
          onChange={(e) => (field === 'slug' ? (setSlugTouched(true), setField('slug', e.target.value.toLowerCase())) : setField(field, e.target.value))}
          className={`${input(field)} ${mono ? 'font-mono text-sm' : ''} ${disabled ? 'bg-gray-100 text-gray-500' : ''}`} />
      )}
      <div className="flex justify-between mt-1 gap-3">
        <p className={`text-xs ${errors[field] ? 'text-red-600' : 'text-gray-500'}`}>{errors[field] || hint || ''}</p>
        {LIMITS[field] && (
          <p className={`text-xs flex-shrink-0 ${form[field].length > LIMITS[field] ? 'text-red-600' : 'text-gray-400'}`}>
            {form[field].length}/{LIMITS[field]}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-cabin-bold text-gray-800">{isEdit ? 'Editar temporada' : 'Nueva temporada'}</h2>
              <p className="text-sm text-gray-600 font-cabin-regular">Los textos que verá el público en la tienda</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {renderField({ field: 'name', title: 'Nombre', hint: 'Corto, p. ej. "Día del Niño". Se usa en "Próxima temporada: …"' })}
            {renderField({ field: 'slug', title: 'Identificador', mono: true, disabled: isEdit, hint: isEdit ? 'No se puede cambiar: enlaza con el diseño del sitio.' : 'Permanente. Enlaza con el diseño del sitio.' })}
          </div>
          {renderField({ field: 'eyebrow', title: 'Rótulo', hint: 'Texto pequeño sobre el título, p. ej. "Colección de Navidad"' })}
          {renderField({ field: 'title', title: 'Título', hint: 'Encabezado de la vitrina cuando es la temporada actual' })}
          {renderField({ field: 'description', title: 'Descripción', multiline: true, hint: 'Texto bajo el título cuando es la temporada actual' })}
          {renderField({ field: 'teaser', title: 'Aviso de próxima temporada', multiline: true, required: false, hint: 'Texto de "Lo que sigue" cuando es la próxima temporada. Si lo dejas vacío, la tienda usa el aviso general.' })}

          {!isEdit && (
            <p className="text-xs text-gray-500 font-cabin-regular bg-amber-50 border border-amber-100 rounded-lg p-3">
              Una temporada nueva se ve con el estilo neutro del sitio. Los colores y las decoraciones (nieve, guirnaldas…)
              se asignan por identificador desde el código de la tienda.
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSaving}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-cabin-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-cabin-medium transition-colors disabled:opacity-50 flex items-center space-x-2">
              {isSaving && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              <span>{isEdit ? 'Guardar cambios' : 'Crear temporada'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeasonInformation;
