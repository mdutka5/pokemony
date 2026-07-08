import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useRouter } from "expo-router";

export default function TabsLayout() {
  const router = useRouter();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="favourite">
        <NativeTabs.Trigger.Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          md={{ default: "favorite", selected: "favorite" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="list">
        <NativeTabs.Trigger.Icon
          sf={{ default: "photo", selected: "photo.fill" }}
          md={{ default: "image", selected: "image" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="camera">
        <NativeTabs.Trigger.Icon
          sf={{ default: "camera", selected: "camera.fill" }}
          md={{ default: "photo_camera", selected: "photo_camera" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Icon
          sf={{ default: "map", selected: "map.fill" }}
          md={{ default: "map", selected: "map" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
