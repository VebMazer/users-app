import { create } from "zustand";

// Create a custom hook called useStore using Zustand library
export const useStore = create((set) => ({
  // initial state variables
  user: null,

  // Apps here do not contain appKey
  publicApps: [],

  // Apps here contain the appKey
  apps: [],

  users: [],

  // actions
  setUser: (user) => set({ user }),
  setPublicApps: (publicApps) => set({ publicApps }),
  setApps: (apps) => set({ apps }),
  setUsers: (users) => set({ users }),
}));
