import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCode, FiX, FiImage, FiUpload, FiSend, FiUserPlus, FiTrash2 } from 'react-icons/fi';
import { getMembershipDetail } from '../api/memberships';
import { saveBookClubFile } from '../api/bookClubApi';
import { sendBatch } from '../api/smtpApi';
import { ROUTES } from '../utils/routes';
import useCorreoMasivoStore from '../store/useCorreoMasivoStore';
import { showError, showSuccess } from '../utils/notifications';

const parseMetadataField = (field) => {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      return null;
    }
  }
  return field;
};

/** De "JESUS VAZQUEZ MEJIA" -> "Jesus" (solo primer nombre, primera mayúscula y resto minúsculas). */
const formatNombreParaCorreo = (fullName) => {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return '';
  const firstWord = trimmed.split(/\s+/)[0] || trimmed;
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};

const getStatusText = (status) => {
  switch (status) {
    case 'active':
      return 'Activa';
    case 'canceled':
      return 'Cancelada';
    case 'past_due':
      return 'Vencida';
    default:
      return status || '—';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'canceled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'past_due':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const EnvioCorreoMasivoSuscriptores = () => {
  const { id: membershipId } = useParams();
  const navigate = useNavigate();
  const [membershipDetail, setMembershipDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalHtmlOpen, setModalHtmlOpen] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState('');
  const [fichaDragOver, setFichaDragOver] = useState(false);
  const [fichaUploading, setFichaUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [extraEmail, setExtraEmail] = useState('');
  const [extraName, setExtraName] = useState('');
  const fileInputRef = React.useRef(null);

  const {
    toggleSubscriber,
    isSelected,
    selectAll,
    deselectAllFromList,
    getSelectedCount,
    getSelected,
    getExtraRecipients,
    addExtraRecipient,
    removeExtraRecipient,
    getTotalRecipientsCount,
    resetAll,
    getEmailSubject,
    setEmailSubject,
    getEmailHtml,
    setEmailHtml,
    getFichaUrl,
    setFichaUrl,
  } = useCorreoMasivoStore();

  useEffect(() => {
    if (!membershipId) {
      navigate(ROUTES.CORREOS_ENVIO_MASIVO);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMembershipDetail(membershipId);
        if (response.status === true && response.membership) {
          setMembershipDetail(response.membership);
        } else {
          setMembershipDetail({ membership_name: '', subscriptions: [] });
        }
      } catch (err) {
        setError(err.message || 'Error al cargar la membresía');
        setMembershipDetail({ membership_name: '', subscriptions: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [membershipId, navigate]);

  const handleBack = () => {
    navigate(ROUTES.CORREOS_ENVIO_MASIVO);
  };

  const subscriptions = membershipDetail?.subscriptions ?? [];
  const allFromListSelected =
    subscriptions.length > 0 && subscriptions.every((s) => isSelected(s.subscription_id));

  const handleSelectAllClick = () => {
    if (allFromListSelected) {
      deselectAllFromList(subscriptions);
    } else {
      selectAll(subscriptions);
    }
  };

  const handleOpenHtmlModal = () => {
    setHtmlDraft(getEmailHtml());
    setModalHtmlOpen(true);
  };

  const handleCloseHtmlModal = () => {
    setModalHtmlOpen(false);
  };

  const handleSaveHtml = () => {
    setEmailHtml(htmlDraft);
    setModalHtmlOpen(false);
  };

  const emailHtml = getEmailHtml();
  const hasEmailHtml = emailHtml.trim().length > 0;
  const fichaUrl = getFichaUrl();
  const hasFichaUrl = fichaUrl.trim().length > 0;
  const hasSubject = getEmailSubject().trim().length > 0;
  const extraRecipients = getExtraRecipients();
  const hasRecipients = getTotalRecipientsCount() > 0;
  const canSendEmail = hasSubject && hasEmailHtml && hasFichaUrl && hasRecipients;

  const handleAddExtraRecipient = () => {
    const email = extraEmail.trim();
    const name = extraName.trim();
    if (!email) {
      showError('El correo es obligatorio.');
      return;
    }
    addExtraRecipient({ email, name });
    setExtraEmail('');
    setExtraName('');
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadFicha = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFichaUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
      const response = await saveBookClubFile(ext, base64);
      if (response.status === true && response.file_url) {
        setFichaUrl(response.file_url);
        showSuccess('Ficha subida correctamente');
      } else {
        showError('No se recibió la URL del archivo');
      }
    } catch (err) {
      showError(err.message || 'Error al subir la ficha');
    } finally {
      setFichaUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFichaDrop = (e) => {
    e.preventDefault();
    setFichaDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFicha(file);
    }
  };

  const handleFichaDragOver = (e) => {
    e.preventDefault();
    setFichaDragOver(true);
  };

  const handleFichaDragLeave = () => {
    setFichaDragOver(false);
  };

  const handleFichaSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFicha(file);
    }
    e.target.value = '';
  };

  /** Arma el body del request a send-batch a partir del store y los suscriptores seleccionados. */
  const buildSendPayload = () => {
    const subject = getEmailSubject().trim();
    const htmlContent = getEmailHtml().trim();
    const fichaUrl = getFichaUrl().trim();
    const selected = getSelected();
    const extra = getExtraRecipients();

    const fromSubscriptions = selected
      .map((sub) => {
        const contactInfo = parseMetadataField(sub.metadata?.contact_information);
        const email = (contactInfo?.email || '').trim();
        const fullname = (contactInfo?.fullname || '').trim() || email;
        const name = formatNombreParaCorreo(fullname) || email;
        if (!email) return null;
        return {
          email,
          name,
          params: {
            NOMBRE: name,
            FICHA_URL: fichaUrl,
          },
        };
      })
      .filter(Boolean);

    const fromExtra = extra
      .map((r) => {
        const email = (r.email || '').trim();
        if (!email) return null;
        const name = formatNombreParaCorreo(r.name || '') || email;
        return {
          email,
          name,
          params: {
            NOMBRE: name,
            FICHA_URL: fichaUrl,
          },
        };
      })
      .filter(Boolean);

    const recipients = [...fromSubscriptions, ...fromExtra];
    return { subject, htmlContent, fichaUrl, recipients };
  };

  const handleSendEmail = async () => {
    const { subject, htmlContent, fichaUrl, recipients } = buildSendPayload();

    if (!subject) {
      showError('Falta el asunto del email.');
      return;
    }
    if (!htmlContent) {
      showError('Falta el HTML del email.');
      return;
    }
    if (!fichaUrl) {
      showError('Falta subir la ficha.');
      return;
    }
    if (recipients.length === 0) {
      showError('Selecciona al menos un destinatario.');
      return;
    }

    setSending(true);
    try {
      const response = await sendBatch({ subject, htmlContent, recipients });
      const sent = response.sent ?? recipients.length;
      showSuccess(`Correo enviado a ${sent} destinatario(s).`);
      resetAll();
      navigate(ROUTES.CORREOS_ENVIO_MASIVO);
    } catch (err) {
      showError(err.message || 'Error al enviar el correo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera con volver */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-cabin-medium text-sm"
        >
          <FiArrowLeft className="w-5 h-5" />
          Volver al envío masivo
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-200 border-t-amber-600" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 font-cabin-regular text-sm">
          {error}
        </div>
      )}

      {!loading && membershipDetail && (
        <>
          <div>
            <h1 className="text-2xl font-cabin-bold text-gray-800">
              {membershipDetail.membership_name}
            </h1>
            <p className="mt-1 text-gray-600 font-cabin-regular">
              {subscriptions.length} suscriptores · {getTotalRecipientsCount()} destinatario(s) en total
            </p>
          </div>

          {/* Asunto del email */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label htmlFor="email-subject" className="block font-cabin-semibold text-gray-800 mb-2">
              Asunto del email
            </label>
            <input
              id="email-subject"
              type="text"
              value={getEmailSubject()}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Ej: Libros de febrero – Entre Libros con Rocío"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-cabin-regular focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Misma línea: HTML del email + Ficha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* HTML del email */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="font-cabin-semibold text-gray-800">HTML del email</h2>
              <p className="mt-0.5 text-sm text-gray-500 font-cabin-regular">
                {hasEmailHtml
                  ? `${emailHtml.length} caracteres definidos`
                  : 'Define el contenido HTML del correo que se enviará.'}
              </p>
              <button
                type="button"
                onClick={handleOpenHtmlModal}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-cabin-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <FiCode className="w-4 h-4" />
                {hasEmailHtml ? 'Editar HTML' : 'Colocar HTML'}
              </button>
            </div>

            {/* Ficha: arrastrar o seleccionar → sube a S3 y guarda URL para params del correo */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="font-cabin-semibold text-gray-800 mb-2">Ficha</h2>
              <p className="text-sm text-gray-500 font-cabin-regular mb-3">
                Arrastra una imagen o haz clic para seleccionar. Se sube a S3 y la URL se usa en los params del correo.
              </p>
              <div
                onDrop={handleFichaDrop}
                onDragOver={handleFichaDragOver}
                onDragLeave={handleFichaDragLeave}
                onClick={() => !fichaUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  fichaUploading ? 'cursor-wait border-amber-300 bg-amber-50' : 'cursor-pointer'
                } ${
                  fichaDragOver ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFichaSelect}
                  className="hidden"
                />
                {fichaUploading ? (
                  <div className="flex flex-col items-center gap-2 text-sm text-amber-700 font-cabin-medium">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-300 border-t-amber-600" />
                    <span>Subiendo ficha...</span>
                  </div>
                ) : hasFichaUrl ? (
                  <div className="flex flex-col items-center gap-1 text-sm text-gray-700 font-cabin-regular">
                    <FiImage className="w-8 h-8 text-green-600" />
                    <span className="font-cabin-medium text-green-700">Ficha subida</span>
                    <span className="text-xs text-gray-500 truncate max-w-full" title={fichaUrl}>{fichaUrl}</span>
                    <span className="text-xs text-gray-400">Haz clic para cambiar</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-sm text-gray-500 font-cabin-regular">
                    <FiUpload className="w-6 h-6 text-gray-400" />
                    <span>Arrastra la ficha aquí o haz clic para seleccionar</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agregar destinatario (temporal) */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="font-cabin-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FiUserPlus className="w-5 h-5 text-amber-600" />
              Agregar destinatario
            </h2>
            <p className="text-sm text-gray-500 font-cabin-regular mb-3">
              Añade correo y nombre para que aparezcan en el email. Son temporales y se listan en la tabla debajo.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="extra-email" className="block text-xs font-cabin-medium text-gray-500 mb-1">
                  Correo
                </label>
                <input
                  id="extra-email"
                  type="email"
                  value={extraEmail}
                  onChange={(e) => setExtraEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-cabin-regular focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="extra-name" className="block text-xs font-cabin-medium text-gray-500 mb-1">
                  Nombre (como se mostrará en el email)
                </label>
                <input
                  id="extra-name"
                  type="text"
                  value={extraName}
                  onChange={(e) => setExtraName(e.target.value)}
                  placeholder="Ej: Jesús"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-cabin-regular focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddExtraRecipient}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-cabin-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <FiUserPlus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>

          {subscriptions.length === 0 && extraRecipients.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-cabin-regular rounded-lg border border-gray-200 bg-gray-50">
              No hay suscriptores en esta membresía. Agrega destinatarios arriba o elige otra membresía.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      {subscriptions.length > 0 ? (
                        <label className="flex items-center gap-2 cursor-pointer font-cabin-medium text-gray-700 text-sm">
                          <input
                            type="checkbox"
                            checked={allFromListSelected}
                            onChange={handleSelectAllClick}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          Seleccionar todos
                        </label>
                      ) : (
                        <span className="text-xs font-cabin-medium text-gray-500">—</span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-cabin-medium text-gray-500 uppercase tracking-wider w-24">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((subscription) => {
                    const contactInfo = parseMetadataField(
                      subscription.metadata?.contact_information
                    );
                    const checked = isSelected(subscription.subscription_id);
                    return (
                      <tr
                        key={subscription.subscription_id}
                        className={checked ? 'bg-amber-50/50' : ''}
                      >
                        <td className="px-4 py-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSubscriber(subscription)}
                              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                          </label>
                        </td>
                        <td className="px-4 py-3 text-sm font-cabin-regular text-gray-800">
                          {contactInfo?.fullname || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-cabin-regular text-gray-600">
                          {contactInfo?.email || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                              subscription.status
                            )}`}
                          >
                            {getStatusText(subscription.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3" />
                      </tr>
                    );
                  })}
                  {extraRecipients.map((r, index) => (
                    <tr key={`extra-${index}-${r.email}`} className="bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-400">—</td>
                      <td className="px-4 py-3 text-sm font-cabin-regular text-gray-800">
                        {r.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-cabin-regular text-gray-600">
                        {r.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border-gray-200">
                          Extra
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeExtraRecipient(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Quitar"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Enviar correo */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSendEmail}
                disabled={sending || !canSendEmail}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-cabin-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-4 h-4" />
              {sending ? 'Enviando...' : 'Enviar correo'}
            </button>
          </div>
        </>
      )}

      {/* Modal para editar HTML del email */}
      {modalHtmlOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCloseHtmlModal}
            aria-hidden
          />
          <div className="flex min-h-full items-center justify-center p-4 relative z-[10000]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-cabin-bold text-gray-800">HTML del email</h3>
                <button
                  type="button"
                  onClick={handleCloseHtmlModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                <div className="flex flex-col min-h-0">
                  <label className="text-xs font-cabin-medium text-gray-500 uppercase tracking-wider mb-1">
                    Código HTML
                  </label>
                  <textarea
                    value={htmlDraft}
                    onChange={(e) => setHtmlDraft(e.target.value)}
                    placeholder="Pega o escribe aquí el HTML del correo..."
                    className="flex-1 min-h-[280px] w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                    spellCheck={false}
                  />
                </div>
                <div className="flex flex-col min-h-0">
                  <label className="text-xs font-cabin-medium text-gray-500 uppercase tracking-wider mb-1">
                    Vista previa
                  </label>
                  <div className="flex-1 min-h-[280px] rounded-lg border border-gray-300 bg-gray-50 overflow-hidden">
                    {htmlDraft.trim() ? (
                      <iframe
                        title="Vista previa del email"
                        srcDoc={htmlDraft}
                        className="w-full h-full min-h-[280px] border-0 bg-white"
                        sandbox="allow-same-origin"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[280px] flex items-center justify-center text-gray-400 font-cabin-regular text-sm">
                        El contenido aparecerá aquí al escribir HTML.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseHtmlModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-cabin-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveHtml}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-cabin-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvioCorreoMasivoSuscriptores;
