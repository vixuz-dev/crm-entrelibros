import React, { useState, useEffect } from 'react';
import { FiCalendar, FiLoader, FiMessageCircle, FiSend, FiEdit2 } from 'react-icons/fi';
import { MONTH_OPTIONS } from '../constants/bookClub';
import { getBookClub, getBookClubQuestions, addBookClubAnswer, updateBookClubAnswer } from '../api/bookClubApi';
import { showDataLoadError, showDataLoadSuccess } from '../utils/notifications';

// Solo Enero y Febrero por ahora
const AVAILABLE_MONTHS = MONTH_OPTIONS.filter((m) => m.value === 'Enero' || m.value === 'Febrero');

const BookClubPreguntas = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [bookClubId, setBookClubId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [savingReplyId, setSavingReplyId] = useState(null);

  const loadQuestionsForMonth = async (month) => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setBookClubId(null);
    setReplyingToId(null);
    setReplyText('');

    try {
      const response = await getBookClub(month);
      if (!response || response.status !== true || !response.book_club) {
        setError(`No hay un Book Club asignado para el mes de ${month}`);
        return;
      }
      const id = response.book_club_id ?? response.book_club?.id ?? response.id;
      if (!id) {
        setError('No se encontró el ID del Book Club');
        return;
      }
      setBookClubId(id);
      const questionsResponse = await getBookClubQuestions(id);
      if (questionsResponse && questionsResponse.body && Array.isArray(questionsResponse.body)) {
        setQuestions(questionsResponse.body);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err.message || 'Error al cargar las preguntas');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      loadQuestionsForMonth(selectedMonth);
    } else {
      setQuestions([]);
      setBookClubId(null);
      setError(null);
    }
  }, [selectedMonth]);

  const hasAnswer = (item) =>
    item.book_club_answer_id != null && item.answer != null && String(item.answer).trim() !== '';

  const openReply = (item) => {
    setReplyingToId(item.book_club_question_id);
    setReplyText(hasAnswer(item) ? String(item.answer || '') : '');
  };

  const closeReply = () => {
    setReplyingToId(null);
    setReplyText('');
    setSavingReplyId(null);
  };

  const handleSubmitReply = async () => {
    const text = replyText?.trim();
    if (!text) {
      showDataLoadError('Preguntas', 'Escribe una respuesta.');
      return;
    }
    const item = questions.find((q) => q.book_club_question_id === replyingToId);
    if (!item) return;

    setSavingReplyId(replyingToId);
    try {
      if (hasAnswer(item)) {
        await updateBookClubAnswer(item.book_club_answer_id, item.book_club_question_id, text);
        showDataLoadSuccess('Preguntas', 'Respuesta actualizada.');
      } else {
        await addBookClubAnswer(item.book_club_question_id, text);
        showDataLoadSuccess('Preguntas', 'Respuesta enviada.');
      }
      closeReply();
      await loadQuestionsForMonth(selectedMonth);
    } catch (err) {
      setSavingReplyId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
          Preguntas
        </h1>
        <p className="text-gray-600 font-cabin-regular">
          Preguntas que las personas envían desde la ecommerce. Elige un mes para ver y responder.
        </p>
      </div>

      {/* Cards de meses (Enero y Febrero) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AVAILABLE_MONTHS.map((monthOption) => {
          const isSelected = selectedMonth === monthOption.value;
          return (
            <button
              key={monthOption.value}
              type="button"
              onClick={() => setSelectedMonth(monthOption.value)}
              className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-200 text-left ${
                isSelected
                  ? 'ring-2 ring-amber-500 border-2 border-amber-500'
                  : 'hover:shadow-xl hover:scale-105'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-lg ${
                    isSelected ? 'bg-amber-100' : 'bg-gray-100'
                  }`}
                >
                  <FiCalendar
                    className={`w-6 h-6 ${
                      isSelected ? 'text-amber-600' : 'text-gray-600'
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-lg font-cabin-bold ${
                      isSelected ? 'text-amber-600' : 'text-gray-800'
                    }`}
                  >
                    {monthOption.label}
                  </h3>
                  <p className="text-sm font-cabin-regular text-gray-500">
                    Ver preguntas
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Área de preguntas del mes seleccionado */}
      {selectedMonth && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-cabin-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiMessageCircle className="w-7 h-7 text-amber-600" />
            Preguntas – {MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label}
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-amber-500 animate-spin mr-3" />
              <span className="text-gray-600 font-cabin-medium">Cargando preguntas...</span>
            </div>
          )}

          {error && !loading && (
            <div className="py-8 text-center">
              <p className="text-red-600 font-cabin-medium">{error}</p>
            </div>
          )}

          {!loading && !error && questions.length === 0 && (
            <div className="py-12 text-center text-gray-500 font-cabin-regular">
              No hay preguntas para este mes.
            </div>
          )}

          {!loading && !error && questions.length > 0 && (
            <ul className="space-y-5">
              {questions.map((item) => (
                <li
                  key={item.book_club_question_id}
                  className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Pregunta y autor */}
                  <p className="text-gray-800 font-cabin-medium text-base leading-relaxed mb-2">
                    {item.question}
                  </p>
                  <p className="text-sm text-gray-500 font-cabin-regular mb-4">
                    {item.name} · {formatDate(item.created_at)}
                  </p>

                  {/* Respuesta existente (cuando no está en modo edición) */}
                  {hasAnswer(item) && replyingToId !== item.book_club_question_id && (
                    <div className="mb-4 p-4 bg-amber-50/80 rounded-lg border border-amber-100 space-y-2">
                      <p className="text-sm font-cabin-semibold text-gray-800">
                        Respuesta:
                      </p>
                      <p className="text-sm text-gray-700 font-cabin-regular">
                        {item.answer}
                      </p>
                      <button
                        type="button"
                        onClick={() => openReply(item)}
                        className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-cabin-medium"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Editar respuesta
                      </button>
                    </div>
                  )}

                  {/* Formulario de respuesta (textarea + botones) al final */}
                  {replyingToId === item.book_club_question_id ? (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        rows={4}
                        disabled={savingReplyId === item.book_club_question_id}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg font-cabin-regular text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleSubmitReply}
                          disabled={savingReplyId === item.book_club_question_id || !replyText?.trim()}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-cabin-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {savingReplyId === item.book_club_question_id ? (
                            <>
                              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <FiSend className="w-4 h-4 mr-2" />
                              {hasAnswer(item) ? 'Actualizar respuesta' : 'Enviar respuesta'}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={closeReply}
                          disabled={savingReplyId === item.book_club_question_id}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-cabin-medium text-sm disabled:opacity-60"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : !hasAnswer(item) ? (
                    <div className="pt-4 flex justify-start">
                      <button
                        type="button"
                        onClick={() => openReply(item)}
                        className="inline-flex items-center px-5 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-cabin-medium text-sm transition-colors"
                      >
                        Responder
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BookClubPreguntas;
