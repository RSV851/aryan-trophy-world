import { create } from 'zustand';

export interface AdminUser {
  id?: string;
  email: string;
  role?: string;
}

export interface AdminProfileData {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  businessName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

interface AuthState {
  user: AdminUser | null;
  profile: AdminProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  fetchSession: () => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: AdminUser | null) => void;
  setProfile: (profile: AdminProfileData | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),

  fetchSession: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/v1/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          // Optionally fetch profile in background
          get().fetchProfile();
          return true;
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch session";
      set({ user: null, isAuthenticated: false, isLoading: false, error: msg });
      return false;
    }
  },

  fetchProfile: async () => {
    try {
      const res = await fetch('/api/v1/admin/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          set({ profile: json.data });
        }
      }
    } catch {
      // Ignore errors silently for profile fetch
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || data.message || "Login failed";
        set({ isLoading: false, error: errMsg });
        return { success: false, error: errMsg };
      }

      // Refresh session state after login
      await get().fetchSession();
      set({ isLoading: false });
      return { success: true };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network error during login";
      set({ isLoading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
    } catch {
      set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
