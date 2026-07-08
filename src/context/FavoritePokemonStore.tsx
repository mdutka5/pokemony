import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoritePokemonType = string | null;

type FavoritePokemonState = {
  favoritePokemon: FavoritePokemonType;
  setFavoritePokemon: (name: FavoritePokemonType) => void;
};

export const useFavoritePokemonStore = create<FavoritePokemonState>()(
  persist(
    (set) => ({
      favoritePokemon: null,
      setFavoritePokemon: (name: FavoritePokemonType) => {
        set({ favoritePokemon: name });
      },
    }),
    {
      name: "favorite-pokemon",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
