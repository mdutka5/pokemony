import { useLocalSearchParams } from "expo-router";
import PokemonDetailView from "../../../src/components/PokemonDetailView";

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PokemonDetailView
      pokemonName={id as string}
      isFavoriteScreen={false}
      customSafeView={false}
    />
  );
}
