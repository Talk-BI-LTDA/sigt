import { create } from "zustand";
import { save, getValueFor, deleteValueFor } from "~/lib/storage";
import type { User, Driver, BackendTokens } from "~/lib/api";

interface AuthState {
  user: User | null;
  driver: Driver | null;
  tokens: BackendTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (
    user: User,
    tokens: BackendTokens,
    driver?: Driver
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  driver: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, tokens, driver) => {
    try {
      await save("access_token", tokens.accessToken);
      await save("refresh_token", tokens.refreshToken);
      await save("token_expires_in", tokens.expiresIn.toString());
      await save("user_data", JSON.stringify({ user, driver }));

      set({
        user,
        driver,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erro ao salvar dados de auth:", error);
    }
  },

  logout: async () => {
    try {
      await deleteValueFor("access_token");
      await deleteValueFor("refresh_token");
      await deleteValueFor("token_expires_in");
      await deleteValueFor("user_data");

      set({
        user: null,
        driver: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  },

  loadStoredAuth: async () => {
    try {
      const [accessToken, refreshToken, expiresIn, userData] =
        await Promise.all([
          getValueFor("access_token"),
          getValueFor("refresh_token"),
          getValueFor("token_expires_in"),
          getValueFor("user_data"),
        ]);

      if (accessToken && refreshToken && expiresIn && userData) {
        const { user, driver } = JSON.parse(userData);
        const tokens: BackendTokens = {
          accessToken,
          refreshToken,
          expiresIn: parseInt(expiresIn),
        };

        // Verificar se token não expirou
        const now = Date.now();
        if (now < tokens.expiresIn) {
          set({
            user,
            driver,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token expirado, fazer logout
          await get().logout();
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Erro ao carregar auth:", error);
      set({ isLoading: false });
    }
  },

  getAccessToken: () => {
    const state = get();
    if (state.tokens && !state.isTokenExpired()) {
      return state.tokens.accessToken;
    }
    return null;
  },

  isTokenExpired: () => {
    const state = get();
    if (!state.tokens) return true;

    const now = Date.now();
    return now >= state.tokens.expiresIn;
  },
}));
