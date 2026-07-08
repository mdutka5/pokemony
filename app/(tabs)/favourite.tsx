import { StyleSheet, Text, View } from "react-native";
import { useFavoritePokemon } from "../../src/context/FavoriteContext";
import PokemonDetailView from "../../src/components/PokemonDetailView";
import { useFavoritePokemonStore } from "../../src/context/FavoritePokemonStore";

export default function FavoritesTabScreen() {
  const favoritePokemon = useFavoritePokemonStore(
    (state) => state.favoritePokemon,
  );

  if (!favoritePokemon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          ⭐ No favorite Pokémon tracked yet.
        </Text>
        <Text style={styles.subText}>
          Go to the Pokédex list to choose your favorite partner!
        </Text>
      </View>
    );
  }

  return (
    <PokemonDetailView
      pokemonName={favoritePokemon}
      isFavoriteScreen={true as boolean}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#495057",
    marginBottom: 8,
  },
  subText: { fontSize: 14, color: "#868e96", textAlign: "center" },
});
