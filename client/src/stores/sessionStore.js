import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSessionStore = create(
  persist(
    (set) => ({
      // Session state
      user: null,
      token: null,
      isAuthenticated: false,

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