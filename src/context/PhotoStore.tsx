// src/context/PhotoStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Photo = {
  id: string;
  uri: string;
  takenAt: number;
  latitude: number;
  longitude: number;
};

type PhotoState = {
  photos: Photo[];
  setPhotos: (photos: Photo[]) => void;
  addPhoto: (photo: Photo) => void;
  removePhoto: (id: string) => void;
};

export const usePhotoStore = create<PhotoState>()(
  persist(
    (set) => ({
      photos: [],
      setPhotos: (photos) => set({ photos }),
      addPhoto: (newPhoto) =>
        set((state) => ({ photos: [...state.photos, newPhoto] })),
      removePhoto: (id) =>
        set((state) => ({ photos: state.photos.filter((p) => p.id !== id) })),
    }),
    {
      name: "captured-photos",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
