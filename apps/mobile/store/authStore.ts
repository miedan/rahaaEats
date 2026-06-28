import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useCartStore } from './cartStore';

const ACCESS_TOKEN_KEY = 'rahaa_access_token';
const REFRESH_TOKEN_KEY = 'rahaa_refresh_token';

export interface AuthUser {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  isAuthenticated: false,

  hydrate: async () => {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    set({ isAuthenticated: !!accessToken, isHydrated: true });
  },

  setSession: async (user, accessToken, refreshToken) => {
    await setTokens(accessToken, refreshToken);
    useCartStore.getState().clear();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await clearTokens();
    useCartStore.getState().clear();
    set({ user: null, isAuthenticated: false });
  },
}));

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
