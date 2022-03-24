import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useContext } from "react";
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
import { CAMP_ALLEN_COORDS } from "../utils/constants";

type Props = StackNativeScreenProps<"Home">;

export default function HomeScreen({ navigation }: Props) {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState(CAMP_ALLEN_COORDS);
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
      <View style={{ flex: 1, flexDirection: "row", width: "100%" }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <MapButton
            label="Trails"
            backgroundColor="blue"
            handlePress={() => navigation.navigate("Trail Screen")}
          />
          <MapButton
            label="Select Trail 16"
            backgroundColor="blue"
            handlePress={() =>
              navigation.navigate("Trail Screen", { trailID: 16 })
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
