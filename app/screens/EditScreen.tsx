import React, { useState, useEffect } from "react";
import MapView from "react-native-maps";
import { Dimensions, StyleSheet, View } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

// Components
import MapButton from "../components/MapButton";

// Constants
const LOCATION_TASK_NAME = "background-location-task";

export default function EditScreen() {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });
  const [isStarted, setIsStarted] = useState(false);
  const [locationArr, setLocationArr] = useState([]);

  // Define the task passing its name and a callback that will be called whenever the location changes
  TaskManager.defineTask(
    LOCATION_TASK_NAME,
    async ({ data: { locations }, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      const [location] = locations;
      setLocationArr([...locationArr, location]);

      console.log("location length=", locationArr.length);
      console.log("time: ", new Date(location.timestamp).getTime());
      console.log("last location: ", location);
      // try {
      //   const url = `https://<your-api-endpoint>`;
      //   await axios.post(url, { location }); // you should use post instead of get to persist data on the backend
      // } catch (err) {
      //   console.error(err);
      // }
    }
  );

  const startRecording = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status === "granted") {
      console.log("status: ", status);

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 1, // minimum change (in meters) betweens updates
        deferredUpdatesInterval: 1000, // minimum interval (in milliseconds) between updates
        // foregroundService is how you get the task to be updated as often as would be if the app was open
        foregroundService: {
          notificationTitle: "Using your location",
          notificationBody:
            "To turn off, go back to the app and switch something off.",
        },
      });
      setIsStarted(true);
    } else {
      console.log("status: ", status);
    }
  };

  const stopRecoding = async () => {
    let value = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    console.log(value);
    if (value) {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("stopped");
      console.log(`There were ${locationArr.length} entries in the array.`);
      setIsStarted(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
      ></MapView>

      <View style={styles.btnContainer}>
        {!isStarted && (
          <MapButton
            label="Start Point"
            backgroundColor="green"
            handlePress={() => {
              startRecording();
              alert("Yay! you can start mapping!");
            }}
          />
        )}

        {isStarted && (
          <MapButton
            label="Stop Point"
            backgroundColor="red"
            handlePress={() => {
              stopRecoding();
              alert("Congratulations, you completed a trail! ");
            }}
          />
        )}

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
