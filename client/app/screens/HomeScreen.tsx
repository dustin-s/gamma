import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import MapView from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Button,
} from "react-native";
import * as Location from "expo-location";

export default function HomeScreen({ navigation }) {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });
  const [errorMsg, setErrorMsg] = useState(null);

  // Error message if current location isn't working.
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { alert ("Permission to access location was denied. The app won't function proporly whithout it activated.")}
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


      <View style={{ position: "absolute" }}>
        <Button
          title="Edit Map"
          onPress={() => navigation.navigate("Edit Map")}
        />
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
  paragraph: {
    position: "absolute",
    top: 100,
    right: 30,
  },
  btnText: {
    fontSize: 20,
    color: "#fff",
  },
  btnContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-evenly",
    bottom: 0,
  },
  mapBtn: {
    marginVertical: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
});
