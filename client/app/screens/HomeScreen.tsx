import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import MapView from "react-native-maps";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import * as Location from "expo-location";

type Props = StackNativeScreenProps<"Home">;

export default function HomeScreen({ navigation }: Props) {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

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
      <MapView
        style={styles.map}
        region={location}
        showsUserLocation={true}
      ></MapView>
      <StatusBar style="auto" />

      <View style={styles.btnContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Admin")}>
          <Image
          source={require("./Settings.png")} 
          style={styles.image}/>
        </TouchableOpacity>
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
  }
});
