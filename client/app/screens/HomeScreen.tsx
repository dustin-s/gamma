import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import MapView from "react-native-maps";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import * as Location from "expo-location";
import { AuthContext } from "../utils/authContext";
import MapButton from "../components/MapButton";

type Props = StackNativeScreenProps<"Home">;

export default function HomeScreen({ navigation }: Props) {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });
  const { auth } = useContext(AuthContext);

  // Error message if current location isn't working.
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert(
          "Permission to access location was denied. The app won't function properly whithout it activated."
        );
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={location} showsUserLocation={true} />
      <StatusBar style="auto" />

      <View style={styles.btnContainer}>
        {!auth.isAuthenticated && (
          <TouchableOpacity onPress={() => navigation.navigate("Admin")}>
            <Image source={require("./Settings.png")} style={styles.image} />
          </TouchableOpacity>
        )}
      </View>

      <View>
        <MapButton
          label="Select Trail 1"
          backgroundColor="Blue"
          handlePress={() =>
            navigation.navigate("Trail Screen", { trailID: 1 })
          }
        />
        {auth.isAuthenticated && (
          <MapButton
            label="Add Trail"
            backgroundColor="blue"
            handlePress={() =>
              navigation.navigate("Trail Screen", { trailID: null })
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  btnContainer: {
    position: "absolute",
    flexDirection: "row",
    right: 10,
    top: 35,
  },
  image: {
    width: 30,
    height: 30,
  },
});
