import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, {
  Marker,
  LongPressEvent,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMapPinsStore, type Pin } from "../../src/context/MapPinsStore";

type PokemonItem = {
  name: string;
  url: string;
};

const PAGE_SIZE = 20;

const getPokemonId = (url: string) => {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
};

export default function PokeMapScreen() {
  const pins = useMapPinsStore((state) => state.pins);
  const addPin = useMapPinsStore((state) => state.addPin);
  const removePin = useMapPinsStore((state) => state.removePin);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [pendingCoord, setPendingCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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

  const detailSheetRef = useRef<BottomSheetModal>(null);
  const searchSheetRef = useRef<BottomSheetModal>(null);

  const detailSnapPoints = useMemo(() => ["35%"], []);
  const searchSnapPoints = useMemo(() => ["55%", "90%"], []);

  const allPokemon = data?.pages.flatMap((page) => page.results) || [];

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

  const handleLongPress = useCallback((event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPendingCoord({ latitude, longitude });
    searchSheetRef.current?.present();
  }, []);

  const handleMarkerPress = useCallback((pin: Pin) => {
    setSelectedPin(pin);
    detailSheetRef.current?.present();
  }, []);

  const handleDeletePin = useCallback(() => {
    if (!selectedPin) return;
    removePin(selectedPin.id);
    detailSheetRef.current?.dismiss();
  }, [selectedPin]);

  const handleSelectPokemon = useCallback(
    (pokemon: PokemonItem) => {
      if (!pendingCoord) return;
      const pokemonId = getPokemonId(pokemon.url);
      addPin({
        id: Date.now().toString(),
        latitude: pendingCoord.latitude,
        longitude: pendingCoord.longitude,
        title: pokemon.name,
        pokemonId,
      });
      searchSheetRef.current?.dismiss();
    },
    [pendingCoord],
  );

  const formatCoord = (
    value: number,
    positiveSuffix: string,
    negativeSuffix: string,
  ) =>
    `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positiveSuffix : negativeSuffix}`;

  const renderPokemonItem = useCallback(
    ({ item }: { item: PokemonItem }) => {
      const pokemonId = getPokemonId(item.url);
      const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
      return (
        <TouchableOpacity
          style={styles.pokemonRow}
          onPress={() => handleSelectPokemon(item)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: imageUrl }} style={styles.pokemonRowImage} />
          <View style={styles.pokemonRowText}>
            <Text style={styles.pokemonRowName}>{item.name}</Text>
            <Text style={styles.pokemonRowId}>#{pokemonId}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelectPokemon],
  );

  // hooks are all above this line — safe to gate the return now
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.sheetTitle}>
          An error has occurred: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: 50.0628,
          longitude: 19.939,
          latitudeDelta: 0.0522,
          longitudeDelta: 0.0221,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onLongPress={handleLongPress}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.title}
            pinColor="blue"
            onPress={() => handleMarkerPress(pin)}
          />
        ))}
      </MapView>

      {/* Pin detail sheet */}
      <BottomSheetModal
        ref={detailSheetRef}
        snapPoints={detailSnapPoints}
        onDismiss={() => setSelectedPin(null)}
      >
        <BottomSheetView style={styles.sheetContent}>
          {selectedPin && (
            <>
              <Text style={styles.sheetTitle}>{selectedPin.title}</Text>
              <Image
                source={{
                  uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPin.pokemonId}.png`,
                }}
                style={styles.sheetSprite}
              />
              <Text style={styles.sheetCoords}>
                {formatCoord(selectedPin.latitude, "N", "S")}
                {"  "}
                {formatCoord(selectedPin.longitude, "E", "W")}
              </Text>
              <View style={styles.divider} />
              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={handleDeletePin}
                >
                  <Text style={styles.btnDeleteText}>Delete Pin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnClose}
                  onPress={() => detailSheetRef.current?.dismiss()}
                >
                  <Text style={styles.btnCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>

      {/* Pokémon search sheet */}
      <BottomSheetModal
        ref={searchSheetRef}
        snapPoints={searchSnapPoints}
        onDismiss={() => setPendingCoord(null)}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetFlatList
          data={allPokemon}
          keyExtractor={(item) => getPokemonId(item.url)}
          renderItem={renderPokemonItem}
          windowSize={5}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.pokemonList}
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  /* Detail sheet */
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    textTransform: "capitalize",
  },
  sheetSprite: {
    width: 96,
    height: 96,
    marginBottom: 4,
  },
  sheetCoords: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ddd",
    marginBottom: 20,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btnDelete: {
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDeleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  btnClose: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnCloseText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },

  /* Search sheet */
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  searchSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  searchInput: {
    backgroundColor: "#f1f3f5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  pokemonList: {
    paddingBottom: 32,
  },
  pokemonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e9ecef",
  },
  pokemonRowImage: {
    width: 52,
    height: 52,
    marginRight: 14,
    backgroundColor: "#f8f9fa",
    borderRadius: 26,
  },
  pokemonRowText: {
    flex: 1,
  },
  pokemonRowName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  pokemonRowId: {
    fontSize: 12,
    color: "#868e96",
    marginTop: 2,
  },
});
