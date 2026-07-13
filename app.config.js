module.exports = {
  expo: {
    name: "pokemony",
    slug: "pokemony",
    version: "1.0.0",
    scheme: "pokemony",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.marcin.pokemony",
      infoPlist: {
        NSCameraUsageDescription:
          "This app needs access to your camera to track faces and display Pokémon on your forehead.",
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.pokemony",
      permissions: ["android.permission.CAMERA"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-status-bar",
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow pokemony to use your location to center the map on you.",
        },
      ],
      "@react-native-vector-icons/material-design-icons",
      [
        "expo-media-library",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to save your Pokémon photos to your gallery.",
          savePhotosPermission:
            "Allow $(PRODUCT_NAME) to save your Pokémon photos to your gallery.",
        },
      ],
    ],
  },
};
