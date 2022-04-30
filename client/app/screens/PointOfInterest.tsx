// this is based on https://www.freecodecamp.org/news/how-to-create-a-camera-app-with-expo-and-react-native/
// https://www.youtube.com/watch?v=RmlekGDv8RU&ab_channel=AaronSaunders
// https://docs.expo.dev/versions/latest/sdk/camera/

import { LocationObjectCoords } from "expo-location";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Types:
import { POIObj } from "../interfaces/POIObj";
import { StackNativeScreenProps } from "../interfaces/StackParamList";

type POIScreenProps = StackNativeScreenProps<"Point of Interest">;

// provide a trailID if available. if a trailID is provided, it will save the prop immediately, otherwise it will send it back to the POI array to be saved with the trail.
export default function PointOfInterest({ navigation, route }: POIScreenProps) {
  const { poi } = route.params;

  return (
    <View style={styles.container}>
      {console.log(poi)}
      <Text>POI Screen</Text>
      <Text>{poi.description}</Text>
      {/* show image and capture buttons */}
      {/* {image ? (
        <>
          <Image source={{ uri: image }} />
          {userId && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // navigate to camera
              }}
            >
              <Text style={styles.text}>Retake image</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          {userId && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // navigate to camera
              }}
            >
              <Text style={styles.text}>Take image</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {/* Show description */}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 130,
    borderRadius: 4,
    backgroundColor: "#14274e",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
