import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { hasPendingNotifications } from '../services/user-service';

const useSessionStore = create(
  persist(
    (set) => ({
      // Session state
      user: null,
      token: null,
      isAuthenticated: false,
      hasPendingNotifications: false,
      // Action to check for pending notifications
      checkPendingNotifications: async () => {
        try {
          const result = await hasPendingNotifications();
          set({ hasPendingNotifications: result.hasPending });
        } catch (error) {
          console.error('Error checking pending notifications:', error);
        }
      },

      // Action to set the session (login)
      login: (userData, token) =>
        set({
          user: userData,
          token,
          isAuthenticated: true,
        }),

      // Action to clear the session (logout)
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      // Action to update user data in the session store
      updateUser: (newData) =>
        set((state) => ({
          user: { ...state.user, ...newData },
        })),
    }),
    {
      name: 'session-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useSessionStore;