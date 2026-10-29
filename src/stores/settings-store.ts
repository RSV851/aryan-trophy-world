import { create } from 'zustand';

interface SettingsState {
  settingsMap: Record<string, any>;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettingsMap: (newMap: Record<string, any>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settingsMap: {},
  isLoading: false,

  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/v1/settings?public=true', {
        method: 'GET',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.map) {
          set({ settingsMap: json.data.map, isLoading: false });
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettingsMap: (newMap) => {
    set((state) => ({
      settingsMap: { ...state.settingsMap, ...newMap },
    }));
  },
}));
