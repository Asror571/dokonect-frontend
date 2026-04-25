import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'ADMIN' | 'DISTRIBUTOR' | 'DRIVER' | 'CLIENT';
  subRole?: 'SUPER_ADMIN' | 'WAREHOUSE_MANAGER' | 'SALES_MANAGER' | 'DRIVER_MANAGER' | null;
  permissions?: any;
  avatar?: string;
  clientId?: string;
  distributorId?: string;
  driverId?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  updateToken: (accessToken: string) => void;
  clearAuth: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        // distributorId / clientId / driverId — response ichida turli joylarda kelishi mumkin
        // Shuning uchun hamma variantni tekshiramiz
        const enrichedUser: User = {
          ...user,
          distributorId: user.distributorId ?? (user as any).distributor?.id ?? undefined,
          clientId:      user.clientId      ?? (user as any).client?.id      ?? undefined,
          driverId:      user.driverId      ?? (user as any).driver?.id      ?? undefined,
        };

        localStorage.setItem('accessToken',  accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user',         JSON.stringify(enrichedUser));

        set({
          user: enrichedUser,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
      },

      updateToken: (accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ accessToken });
      },

      clearAuth: () => {
        localStorage.clear();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.clear();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);