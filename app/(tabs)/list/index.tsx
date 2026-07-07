import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo, useCallback, memo } from "react";

interface PokemonItem {
  name: string;
  url: string;
}

const getPokemonId = (url: string) => {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
};

type PokemonRowProps = {
  item: PokemonItem;
  onPress: (name: string) => void;
};

const PokemonRow = memo(({ item, onPress }: PokemonRowProps) => {
  const pokemonId = getPokemonId(item.url);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  return (
    <Pressable style={styles.pokemonItem} onPress={() => onPress(item.name)}>
      <View style={styles.listItemContainer}>
        <Text style={styles.pokemonText}>
          #{pokemonId} {item.name}
        </Text>
        <Image source={{ uri: imageUrl }} style={styles.pokemonImage} />
      </View>
    </Pressable>
  );
});

export default function ListScreen() {
  const router = useRouter();

  const [allPokemon, setAllPokemon] = useState<PokemonItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0",
        );
        const json = await response.json();
        setAllPokemon(json.results);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handlePress = useCallback(
    (name: string) => {
      router.push(`/list/${name}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: PokemonItem }) => (
      <PokemonRow item={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  const filteredPokemon = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPokemon;
    return allPokemon.filter((p) => p.name.includes(q));
  }, [allPokemon, query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Pokémon..."
          placeholderTextColor="#adb5bd"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e63946" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredPokemon}
          keyExtractor={(item) => getPokemonId(item.url)}
          windowSize={5}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Pokémon found for "{query}"</Text>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#868e96",
  },
  pokemonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pokemonImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    backgroundColor: "#f1f3f5",
    borderRadius: 30,
  },
  pokemonText: { fontSize: 18, fontWeight: "600", color: "#333" },
});
