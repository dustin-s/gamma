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

export default function EditScreen() {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
      ></MapView>

      <View style={styles.btnContainer}>
        <TouchableOpacity
          onPress={() => alert("Yay! you can start mapping!")}
          style={[styles.mapBtn, { backgroundColor: "green" }]}
        >
          <Text style={styles.btnText}>Start Point</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => alert("Congratulations, you completed a trail! ")}
          style={[styles.mapBtn, { backgroundColor: "red" }]}
        >
          <Text style={styles.btnText}>Stop Point</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            alert(
              "You will now be able to re-walk this trail any time you want."
            )
          }
          style={[styles.mapBtn, { backgroundColor: "blue" }]}
        >
          <Text style={styles.btnText}>Save</Text>
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
