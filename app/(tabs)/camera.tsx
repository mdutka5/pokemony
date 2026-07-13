import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from "react-native-vision-camera";
import { Camera, type Face } from "react-native-vision-camera-face-detector";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";

const MIRROR_FRONT_PHOTO = true;

type Placement = { x: number; y: number; size: number };

export default function PokemonCameraScreen() {
  const [faceDetected, setFaceDetected] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "back",
  );
  const device = useCameraDevice(cameraPosition);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const photoOutput = usePhotoOutput({});

  const composerRef = useRef<View>(null);

  const pokemonX = useSharedValue(0);
  const pokemonY = useSharedValue(0);
  const pokemonSize = useSharedValue(0);

  const lastPlacement = useRef<Placement | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [pendingShot, setPendingShot] = useState<{
    uri: string;
    mirrored: boolean;
    placement: Placement | null;
  } | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);

  const faceDetectorOptions = useRef({
    performanceMode: "fast" as const,
    windowWidth: SCREEN_WIDTH,
    windowHeight: SCREEN_HEIGHT,
  }).current;

  function handleFacesDetected(faces: Face[]) {
    if (faces.length === 0) {
      setFaceDetected(false);
      lastPlacement.current = null;
      return;
    }

    const { bounds } = faces[0];

    const x =
      cameraPosition === "front"
        ? bounds.x
        : SCREEN_WIDTH - bounds.x - bounds.width;
    const y = bounds.y - bounds.height * 0.5;

    pokemonSize.value = bounds.width;
    pokemonX.value = x;
    pokemonY.value = y;
    lastPlacement.current = { x, y, size: bounds.width };

    setFaceDetected(true);
  }

  const animatedPokemonStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: pokemonX.value,
    top: pokemonY.value,
    width: pokemonSize.value,
    height: pokemonSize.value,
  }));

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  const takePicture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const placement = lastPlacement.current;

      const { filePath } = await photoOutput.capturePhotoToFile({}, {});

      setPendingShot({
        uri: `file://${filePath}`,
        mirrored: MIRROR_FRONT_PHOTO && cameraPosition === "front",
        placement,
      });
    } catch (e) {
      console.error("capturePhotoToFile failed", e);
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    if (!pendingShot) return;

    const t = setTimeout(async () => {
      try {
        const uri = await captureRef(composerRef, {
          format: "jpg",
          quality: 0.95,
          result: "tmpfile",
        });
        setResultUri(uri);
      } catch (e) {
        console.error("compose failed", e);
      } finally {
        setPendingShot(null);
        setIsCapturing(false);
      }
    }, 120);

    return () => clearTimeout(t);
  }, [pendingShot]);

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

  const toggleCamera = () =>
    setCameraPosition((prev) => (prev === "front" ? "back" : "front"));

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        outputs={[photoOutput]}
        orientationSource="device"
        onFacesDetected={handleFacesDetected}
        onError={(error: unknown) => console.error("camera mount error", error)}
        autoMode={true}
        cameraFacing={cameraPosition}
        {...faceDetectorOptions}
      />

      {faceDetected && (
        <Animated.View style={animatedPokemonStyle} pointerEvents="none">
          <Image
            source={require("../../assets/images/snorlax.png")}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.shutterButton}
        onPress={takePicture}
        disabled={isCapturing}
        activeOpacity={0.7}
      >
        {isCapturing ? (
          <ActivityIndicator color="black" />
        ) : (
          <View style={styles.shutterInner} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={toggleCamera}
        activeOpacity={0.7}
      >
        <Ionicons name="camera-reverse-outline" size={32} color="white" />
      </TouchableOpacity>

      {pendingShot && (
        <View
          ref={composerRef}
          collapsable={false}
          style={[
            styles.composer,
            { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
          ]}
        >
          <Image
            source={{ uri: pendingShot.uri }}
            style={[
              StyleSheet.absoluteFill,
              pendingShot.mirrored ? { transform: [{ scaleX: -1 }] } : null,
            ]}
            resizeMode="cover"
          />
          {pendingShot.placement && (
            <Image
              source={require("../../assets/images/snorlax.png")}
              style={{
                position: "absolute",
                left: pendingShot.placement.x,
                top: pendingShot.placement.y,
                width: pendingShot.placement.size,
                height: pendingShot.placement.size,
              }}
              resizeMode="contain"
            />
          )}
        </View>
      )}

      {resultUri && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: resultUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setResultUri(null)}
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  composer: { position: "absolute", top: -100000, left: 0 },
  shutterButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 30,
    alignSelf: "center",
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "white",
  },
  iconButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 30,
    right: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  pokemonImage: { width: "100%", height: "100%" },
});
