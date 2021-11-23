import React, { useState, useEffect } from "react";
import MapView from "react-native-maps";
import { Dimensions, StyleSheet, View } from "react-native";
// Components
import MapButton from "../components/MapButton";

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
        <MapButton
          label="Start Point"
          backgroundColor="green"
          handlePress={() => alert("Yay! you can start mapping!")}
        />

        <MapButton
          label="Stop Point"
          backgroundColor="red"
          handlePress={() => alert("Congratulations, you completed a trail! ")}
        />

        <MapButton
          label="Save"
          backgroundColor="blue"
          handlePress={() =>
            alert(
              "You will now be able to re-walk this trail any time you want."
            )
          }
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
  btnContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-evenly",
    bottom: 0,
  },
});
