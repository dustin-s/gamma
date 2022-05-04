import { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CameraView() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const cameraRef = useRef<Camera>(null);

  const getPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const __takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log(photo);
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
          <TouchableOpacity
            style={[styles.photoButton, styles.button]}
            onPress={__takePicture}
          />
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
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "transparent",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  photoButton: {
    width: 70,
    height: 70,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "#fff",
  },
});
