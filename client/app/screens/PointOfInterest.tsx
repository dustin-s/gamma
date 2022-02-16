// this is based on https://www.freecodecamp.org/news/how-to-create-a-camera-app-with-expo-and-react-native/
// https://www.youtube.com/watch?v=RmlekGDv8RU&ab_channel=AaronSaunders
// https://docs.expo.dev/versions/latest/sdk/camera/

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

interface coordsObj {
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  latitude: number;
  longitude: number;
  speed?: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

interface POIObj {
  trailID: number | null;
  description: string | null;
  image: string | null;
  isActive: boolean;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  latitude: number;
  longitude: number;
  speed?: number;
}

interface POIProps {
  poi: POIObj | undefined;
  handleSetPoI(newPoI: POIObj): any;
  trailId: number | null;
  userId: number | null;
  currentLocation: coordsObj;
}

// provide a trailID if available. if a trailID is provided, it will save the prop immediately, otherwise it will send it back to the POI array to be saved with the trail.
export default function PointOfInterest({
  poi,
  handleSetPoI,
  trailId,
  userId,
  currentLocation,
}: POIProps) {
  const [image, setImage] = useState<string | null>(poi?.image || null);
  const [description, setDescription] = useState<string>(
    poi?.description || ""
  );
  const [isActive, setIsActive] = useState<boolean>(poi?.isActive || true);

  return (
    <View style={styles.container}>
      {/* show image and capture buttons */}
      {image ? (
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
      {!userId ? (
        <Text style={styles.text}>{description}</Text>
      ) : (
        <>
          <TextInput
            style={styles.text}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={(newDescription) => setDescription(newDescription)}
          />

          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isActive ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setIsActive(!isActive)}
            value={isActive}
          />
        </>
      )}
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
