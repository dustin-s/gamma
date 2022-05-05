import { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CameraViewProps {
  handleImage(photo: string): void;
}

export default function CameraView({ handleImage }: CameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cameraRef = useRef<Camera>(null);

  const getPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const __takePicture = async () => {
    try {
      setIsLoading(true);
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        setIsLoading(false);
        handleImage(photo.uri);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={{ alignSelf: "flex-end" }}
            />
          ) : (
            <TouchableOpacity
              style={styles.photoButton}
              onPress={async () => {
                await __takePicture();
              }}
            >
              <Text style={styles.photoButtonText}>{`Take`}</Text>
              <Text style={styles.photoButtonText}>{`Photo`}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "transparent",
    margin: 20,
  },
  photoButton: {
    width: 70,
    height: 70,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "#fff",

    // button alignment
    alignSelf: "flex-end",
    alignItems: "center",
    // button text alignment
    justifyContent: "center",
    alignContent: "center",
  },
  photoButtonText: {
    color: "black",
  },
});
