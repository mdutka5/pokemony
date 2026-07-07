import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritePokemonContextType {
  favoritePokemon: string | null;
  setFavoritePokemon: (name: string | null) => Promise<void>;
}

const FavoritePokemonContext = createContext<FavoritePokemonContextType | undefined>(undefined);

const STORAGE_KEY = 'FAVORITE_POKEMON';

export function FavoritePokemonProvider({ children }: { children: React.ReactNode }) {
  const [favoritePokemon, setFavoritePokemonState] = useState<string | null>(null);

  // 2. Load the name string using AsyncStorage on boot
  useEffect(() => {
    async function loadFavorite() {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        setFavoritePokemonState(value); // Will be the string or null
      } catch (e) {
        console.error('Failed to load favorite pokemon from AsyncStorage', e);
      }
    }
    loadFavorite();
  }, []);

  // 3. Persist modifications back to AsyncStorage
  const setFavoritePokemon = async (name: string | null) => {
    setFavoritePokemonState(name);
    try {
      if (name) {
        await AsyncStorage.setItem(STORAGE_KEY, name);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save to AsyncStorage', e);
    }
  };

  return (
    <FavoritePokemonContext.Provider value={{ favoritePokemon, setFavoritePokemon }}>
      {children}
    </FavoritePokemonContext.Provider>
  );
}

export function useFavoritePokemon() {
  const context = useContext(FavoritePokemonContext);
  if (!context) throw new Error('useFavoritePokemon must be used within FavoritePokemonProvider');
  return context;
}