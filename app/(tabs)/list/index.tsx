import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useCallback, memo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";

interface PokemonItem {
  name: string;
  url: string;
}

const PAGE_SIZE = 20;

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

  // 1. Switch to useInfiniteQuery
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: ({ pageParam = 0 }) =>
      fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${pageParam}`,
      ).then((res) => res.json()),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      return parseInt(url.searchParams.get("offset") || "0", 10);
    },
  });

  if (error)
    return (
      <Text style={styles.emptyText}>
        An error has occurred: {error.message}
      </Text>
    );

  const allPokemon = data?.pages.flatMap((page) => page.results) || [];

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

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        size="small"
        color="#e63946"
        style={{ marginVertical: 16 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#e63946" style={styles.loader} />
      ) : (
        <FlatList
          data={allPokemon}
          keyExtractor={(item) => getPokemonId(item.url)}
          windowSize={5}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
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
