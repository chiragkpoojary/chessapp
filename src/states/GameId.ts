import { create } from "zustand";

export const useGameStore = create((set) => ({
    gameId: "",
    setGameId: (id) => set({ gameId: id })
}));
