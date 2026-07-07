import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameOutput,
} from "react-native-vision-camera";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useFaceDetector } from "react-native-vision-camera-face-detector";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PokemonCameraScreen() {
  const [faceDetected, setFaceDetected] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "back",
  );
  const device = useCameraDevice(cameraPosition);

  const pokemonX = useSharedValue(0);
  const pokemonY = useSharedValue(0);
  const pokemonSize = useSharedValue(0);

  const faceDetector = useFaceDetector({ performanceMode: "fast" });

  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        const faces = faceDetector.detectFaces(frame);

        if (faces && faces.length > 0) {
          const face = faces[0];
          if (!faceDetected) runOnJS(setFaceDetected)(true);

          // 1. Calculate the scale multiplier between the camera frame and your screen size
          // Camera frames are sideways, so we swap: screen width maps to frame height
          const scaleX = SCREEN_WIDTH / frame.height;
          const scaleY = SCREEN_HEIGHT / frame.width;

          // 2. Adjust for the Selfie Mirror Effect if using the front camera
          let correctedX = face.bounds.x * scaleX;
          if (cameraPosition === "front") {
            correctedX =
              SCREEN_WIDTH -
              face.bounds.x * scaleX -
              face.bounds.width * scaleX;
          }

          // 3. Assign the correctly scaled values to your tracking animations
          pokemonSize.value = face.bounds.width * scaleX;
          pokemonX.value = correctedX;

          // FOREHEAD MATH: Shift Y upwards by 25% of the scaled face height
          pokemonY.value =
            face.bounds.y * scaleY - face.bounds.height * scaleY * 0.25;
        } else {
          if (faceDetected) runOnJS(setFaceDetected)(false);
        }
      } finally {
        frame.dispose();
      }
    },
  });

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
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        outputs={[frameOutput]}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  iconButton: {
    position: "absolute",
    bottom: 40,
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
