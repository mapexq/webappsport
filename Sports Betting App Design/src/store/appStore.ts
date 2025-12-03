import { create } from 'zustand';
import type { TabType, ConnectionIssue } from '../types';

interface AppState {
  activeTab: TabType;
  connectionIssue: ConnectionIssue;
  setActiveTab: (tab: TabType) => void;
  setConnectionIssue: (issue: ConnectionIssue) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'bonuses',
  connectionIssue: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setConnectionIssue: (issue) => set({ connectionIssue: issue }),
}));


