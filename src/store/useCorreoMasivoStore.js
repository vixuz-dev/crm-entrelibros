import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const CORREO_MASIVO_STORAGE_KEY = 'correo-masivo-store';

/**
 * Store para el envío de correo masivo (persistente en localStorage).
 * Mantiene la lista de suscriptores seleccionados, HTML y URL de ficha.
 */
const useCorreoMasivoStore = create(
  persist(
    (set, get) => ({
      selectedSubscribers: [],
      extraRecipients: [],

      emailSubject: '',
      emailHtml: '',
      fichaUrl: '',

      addExtraRecipient: ({ email, name }) => {
        const e = (email || '').trim();
        const n = (name || '').trim();
        if (!e) return;
        set({
          extraRecipients: [...get().extraRecipients, { email: e, name: n }],
        });
      },

      removeExtraRecipient: (index) => {
        const list = get().extraRecipients.filter((_, i) => i !== index);
        set({ extraRecipients: list });
      },

      getExtraRecipients: () => get().extraRecipients,

      setEmailSubject: (subject) => set({ emailSubject: subject ?? '' }),

      getEmailSubject: () => get().emailSubject,

      setEmailHtml: (html) => set({ emailHtml: html ?? '' }),

      getEmailHtml: () => get().emailHtml,

      setFichaUrl: (url) => set({ fichaUrl: url ?? '' }),

      getFichaUrl: () => get().fichaUrl,

      addSubscriber: (subscription) => {
        const { selectedSubscribers } = get();
        if (selectedSubscribers.some((s) => s.subscription_id === subscription.subscription_id)) {
          return;
        }
        set({ selectedSubscribers: [...selectedSubscribers, subscription] });
      },

      removeSubscriber: (subscriptionId) => {
        set({
          selectedSubscribers: get().selectedSubscribers.filter(
            (s) => s.subscription_id !== subscriptionId
          ),
        });
      },

      toggleSubscriber: (subscription) => {
        const { selectedSubscribers } = get();
        const exists = selectedSubscribers.some((s) => s.subscription_id === subscription.subscription_id);
        if (exists) {
          set({
            selectedSubscribers: selectedSubscribers.filter(
              (s) => s.subscription_id !== subscription.subscription_id
            ),
          });
        } else {
          set({ selectedSubscribers: [...selectedSubscribers, subscription] });
        }
      },

      isSelected: (subscriptionId) => {
        return get().selectedSubscribers.some((s) => s.subscription_id === subscriptionId);
      },

      selectAll: (subscriptions) => {
        const { selectedSubscribers } = get();
        const existingIds = new Set(selectedSubscribers.map((s) => s.subscription_id));
        const toAdd = (subscriptions || []).filter((s) => s?.subscription_id && !existingIds.has(s.subscription_id));
        if (toAdd.length === 0) return;
        set({ selectedSubscribers: [...selectedSubscribers, ...toAdd] });
      },

      deselectAllFromList: (subscriptions) => {
        const ids = new Set((subscriptions || []).map((s) => s.subscription_id));
        set({
          selectedSubscribers: get().selectedSubscribers.filter((s) => !ids.has(s.subscription_id)),
        });
      },

      clearSelection: () => {
        set({ selectedSubscribers: [] });
      },

      getSelectedCount: () => get().selectedSubscribers.length,

      getSelected: () => get().selectedSubscribers,

      getTotalRecipientsCount: () =>
        get().selectedSubscribers.length + get().extraRecipients.length,

      /** Reinicia todo el store (tras envío exitoso). */
      resetAll: () =>
        set({
          selectedSubscribers: [],
          extraRecipients: [],
          emailSubject: '',
          emailHtml: '',
          fichaUrl: '',
        }),
    }),
    {
      name: CORREO_MASIVO_STORAGE_KEY,
      partialize: (state) => ({
        selectedSubscribers: state.selectedSubscribers,
        extraRecipients: state.extraRecipients,
        emailSubject: state.emailSubject,
        emailHtml: state.emailHtml,
        fichaUrl: state.fichaUrl,
      }),
    }
  )
);

export default useCorreoMasivoStore;
