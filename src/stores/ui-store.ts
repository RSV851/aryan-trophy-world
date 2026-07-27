import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  activeGroup: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setActiveGroup: (group: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false, // For mobile drawer toggle
  isSidebarCollapsed: false, // For desktop condensed mode
  activeGroup: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setActiveGroup: (group) => set({ activeGroup: group }),
}));
