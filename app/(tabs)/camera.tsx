import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
  Platform,
} from "react-native";
import {
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { Camera, type Face } from "react-native-vision-camera-face-detector";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PokemonCameraScreen() {
  const [faceDetected, setFaceDetected] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "back",
  );
  const device = useCameraDevice(cameraPosition);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const pokemonX = useSharedValue(0);
  const pokemonY = useSharedValue(0);
  const pokemonSize = useSharedValue(0);

  // Base detector options. windowWidth/windowHeight + autoMode (passed as a
  // separate prop below, matching the library's own example) tell the
  // native detector to hand back `bounds` already converted into on-screen
  // pixel coordinates. No manual scaling or mirroring math needed on our
  // side, and no worklet/frame-processor plumbing either — this component
  // handles it internally and just calls back with plain JS faces.
  const faceDetectorOptions = useRef({
    performanceMode: "fast" as const,
    windowWidth: SCREEN_WIDTH,
    windowHeight: SCREEN_HEIGHT,
  }).current;

  function handleFacesDetected(faces: Face[]) {
    if (faces.length === 0) {
      setFaceDetected(false);
      return;
    }

    const { bounds } = faces[0];

    pokemonSize.value = bounds.width;
    if (cameraPosition === "front") {
      pokemonX.value = bounds.x;
    } else {
      pokemonX.value = SCREEN_WIDTH - bounds.x - bounds.width;
    }
    // Shift up a bit so Snorlax sits a little above the face, not centered
    // dead over it.
    pokemonY.value = bounds.y - bounds.height * 0.5;

    setFaceDetected(true);
  }

  const animatedPokemonStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: pokemonX.value,
      top: pokemonY.value,
      width: pokemonSize.value,
      height: pokemonSize.value,
    };
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  if (!hasPermission)
    return (
      <View style={styles.center}>
        <Text>Granting Camera Permission...</Text>
      </View>
    );
  if (!device)
    return (
      <View style={styles.center}>
        <Text>No camera device found.</Text>
      </View>
    );
  const toggleCamera = () => {
    setCameraPosition((prev) => (prev === "front" ? "back" : "front"));
  };

  return (
    //<SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        orientationSource="device"
        onFacesDetected={handleFacesDetected}
        onError={(error) => console.error("camera mount error", error)}
        autoMode={true}
        cameraFacing={cameraPosition}
        {...faceDetectorOptions}
      />

      {faceDetected && (
        <Animated.View style={animatedPokemonStyle}>
          <Image
            source={require("../../assets/images/snorlax.png")}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.iconButton}
        onPress={toggleCamera}
        activeOpacity={0.7}
      >
        <Ionicons name="camera-reverse-outline" size={32} color="white" />
      </TouchableOpacity>
    </View>
    //</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  iconButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 30,
    right: 30, // Floats nicely on the bottom-right corner of the camera view
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent dark circle
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Adds a drop shadow on Android
  },
  pokemonImage: { width: "100%", height: "100%" },
});
