import { SetStateAction } from "react";
import * as ImagePicker from "expo-image-picker";
import MapButton from "./MapButton";

interface ShowCameraProps {
  label: string;
  setTakenImagePath(value: SetStateAction<string | null>): void;
}

function ShowCamera({ label, setTakenImagePath }: ShowCameraProps) {
  const takePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.cancelled) {
      setTakenImagePath(result.uri);
    }
  };

  return (
    <MapButton label={label} handlePress={takePicture} backgroundColor="blue" />
  );
}

export default ShowCamera;
