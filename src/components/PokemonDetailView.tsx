import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useFavoritePokemonStore } from "../context/FavoritePokemonStore";
import { SafeAreaView } from "react-native-safe-area-context";

type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other?: { "official-artwork"?: { front_default: string } };
  };
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
};

export default function PokemonDetailView({
  pokemonName,
  isFavoriteScreen,
}: {
  pokemonName: string;
  isFavoriteScreen: boolean;
}) {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const favoritePokemon = useFavoritePokemonStore(
    (state) => state.favoritePokemon,
  );
  const setFavoritePokemon = useFavoritePokemonStore(
    (state) => state.setFavoritePokemon,
  );

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`,
        );
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error("Error fetching individual Pokémon details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (pokemonName) fetchDetails();
  }, [pokemonName]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ff4d4d" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Could not load Pokémon data.</Text>
      </View>
    );
  }

  const displayImage =
    details.sprites.other?.["official-artwork"]?.front_default ||
    details.sprites.front_default;

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "android" ? ["top"] : ["top", "bottom"]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.pokeId}>
            #{details.id.toString().padStart(3, "0")}
          </Text>
          <Text style={styles.pokeName}>{details.name.toUpperCase()}</Text>
          <Image source={{ uri: displayImage }} style={styles.image} />
          <View style={styles.badgeRow}>
            {details.types.map((t) => (
              <View key={t.type.name} style={styles.badge}>
                <Text style={styles.badgeText}>{t.type.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          {favoritePokemon &&
          details.name.toLowerCase() === favoritePokemon.toLowerCase() ? (
            <Pressable onPress={() => setFavoritePokemon(null)}>
              {isFavoriteScreen ? (
                <Text style={styles.alreadyFavoriteButton}>
                  Remove from Favorites
                </Text>
              ) : (
                <Text style={styles.alreadyFavoriteButton}>❤️ Favorited!</Text>
              )}
            </Pressable>
          ) : (
            <Pressable onPress={() => setFavoritePokemon(details.name)}>
              <Text style={styles.addFavoriteButton}>Add to Favorites</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Physical Attributes</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>HEIGHT</Text>
              <Text style={styles.gridValue}>{details.height / 10} m</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>WEIGHT</Text>
              <Text style={styles.gridValue}>{details.weight / 10} kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Base Stats</Text>
          {details.stats.map((s) => (
            <View key={s.stat.name} style={styles.statRow}>
              <Text style={styles.statLabel}>{s.stat.name.toUpperCase()}</Text>
              <Text style={styles.statValue}>{s.base_stat}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 20 },
  center: { justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#ff4d4d", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  pokeId: { fontSize: 18, fontWeight: "700", color: "#adb5bd" },
  pokeName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#212529",
    letterSpacing: 0.5,
  },
  image: { width: 180, height: 180, marginVertical: 10 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: {
    backgroundColor: "#e9ecef",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#495057",
    textTransform: "capitalize",
  },
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#212529",
    marginBottom: 15,
  },
  grid: { flexDirection: "row", gap: 15 },
  gridItem: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#adb5bd",
    marginBottom: 4,
  },
  gridValue: { fontSize: 18, fontWeight: "800", color: "#495057" },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  statLabel: { fontSize: 13, fontWeight: "600", color: "#6c757d" },
  statValue: { fontSize: 15, fontWeight: "700", color: "#212529" },
  addFavoriteButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    backgroundColor: "#ff4d4d",
    textTransform: "capitalize",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    textAlign: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  alreadyFavoriteButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#495057", // Soft dark gray text
    backgroundColor: "#e9ecef", // Light gray background to show it's already selected
    borderWidth: 1,
    borderColor: "#ced4da", // Subtle border line
    textTransform: "capitalize",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    textAlign: "center",
    overflow: "hidden",
  },
});
