import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Pin = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  pokemonId: string;
};

type MapPinsState = {
  pins: Pin[];
  setPins: (pins: Pin[]) => void;
  addPin: (pin: Pin) => void;
  removePin: (id: string) => void;
};

export const useMapPinsStore = create<MapPinsState>()(
  persist(
    (set) => ({
      pins: [],
      setPins: (pins) => set({ pins }),
      addPin: (newPin) => set((state) => ({ pins: [...state.pins, newPin] })),
      removePin: (id) =>
        set((state) => ({ pins: state.pins.filter((p) => p.id !== id) })),
    }),
    {
      name: "map-pins",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
