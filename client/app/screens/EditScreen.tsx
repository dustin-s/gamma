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
  // Types
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

  interface locationObj {
    coords: coordsObj;
    timestamp: number;
  }

  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [locationArr, setLocationArr] = useState<locationObj[]>([]);

  // Define the task passing its name and a callback that will be called whenever the location changes
  TaskManager.defineTask(
    LOCATION_TASK_NAME,
    async ({ data: { locations }, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log("locations:", locations);

      const [location] = locations;
      setLocationArr([...locationArr, location]);

      console.log("location length=", locationArr.length);
      console.log(`time:  ${new Date(location.timestamp).toLocaleString()}`);
      console.log("last location: ", location);
      // try {
      //   const url = `https://<your-api-endpoint>`;
      //   await axios.post(url, { location }); // you should use post instead of get to persist data on the backend
      // } catch (err) {
      //   console.error(err);
      // }
    }
  );

  const handleStartRecording = async () => {
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
      alert("You will now be able to re-walk this trail any time you want.");
    } else {
      console.log("status: ", status);
    }
  };

  const handleStopRecoding = async () => {
    let value = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    console.log(value);
    if (value) {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("************************************\n");
      console.log("stopped");
      console.log(`There were ${locationArr.length} entries in the array.`);
      console.log("\n************************************");
      setIsStarted(false);
      alert("Congratulations, you completed a trail! ");
    }
  };

  const handleSave = () => {
    console.log("*** Save Data ***");
    console.log(locationArr);
    console.log("\n************************************");
    setLocationArr([]);
    alert("Trail saved");
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
            handlePress={handleStartRecording}
          />
        )}

        {isStarted && (
          <MapButton
            label="Stop Point"
            backgroundColor="red"
            handlePress={handleStopRecoding}
          />
        )}

        {!isStarted && locationArr.length > 0 && (
          <MapButton
            label="Save"
            backgroundColor="blue"
            handlePress={handleSave}
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