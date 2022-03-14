import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import MapView from "react-native-maps";
import { Alert, Dimensions, StyleSheet, View } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

// Components
import MapButton from "../components/MapButton";
import { AuthContext } from "../utils/authContext";

// Constants
const LOCATION_TASK_NAME = "background-location-task";

// Types
import { LocationObject, LocationObjectCoords } from "expo-location";
import { POIObj } from "../interfaces/POIObj";
import SaveTrailModal from "../components/SaveTrailModal";
type ScreenProps = StackNativeScreenProps<"Trail Screen">;
type TrailScreenProps = ScreenProps & { trailID?: number | null };
// type TrailScreenProps = StackNativeScreenProps<"Trail Screen">;

// Main function
export default function TrailScreen({
  navigation,
  trailID = null,
}: TrailScreenProps) {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

  const { auth } = useContext(AuthContext);
  const userId = auth.userData?.user.userId || null;

  const [locationArr, setLocationArr] = useState<LocationObjectCoords[]>([]);
  const [pOIArr, setPOIArr] = useState<POIObj[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [isStarted, setIsStarted] = useState<boolean>(false);
  useEffect(() => {
    if (isStarted) {
      console.log("Trail Recording started");
    }
  }, [isStarted]);

  // Get background permission if there is no trailID. This isn't necessary if the user is not recording a trail.
  const [statusBG, requestPermission] = Location.useBackgroundPermissions();
  useEffect(() => {
    if (!statusBG?.granted && !trailID) {
      requestPermission();
    }
  }, []);

  // Define the task passing its name and a callback that will be called whenever the location changes
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error("TaskManager.defineTask error:");
      console.error(error);
      return;
    }
    const curData = data as any;

    // const [location] = locations;
    const [location] = curData.locations;

    setLocationArr([...locationArr, location.coords]);

    console.log("\nlocation length=", locationArr.length);
    console.log(`time:  ${new Date(location.timestamp).toLocaleString()}`);
    console.log("last location:\n", location);
  });

  const handleStartRecording = async () => {
    if (statusBG?.granted) {
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
      console.log("status: ", statusBG?.status || null);
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
    }
  };

  const handleSave = () => {
    console.log("*** Save Data ***");
    console.log(locationArr);
    console.log("\n************************************");
    setModalVisible(true);

    setLocationArr([]);
    setPOIArr([]);
    alert("Trail saved");
  };

  const currentLocation = () => {
    // if (trailID) {
    //   // return the current location on the trail
    // } else {
    return locationArr[locationArr.length - 1];
    // }
  };
  const handleSetPoI = (newPoI: POIObj) => {
    if (auth.isAuthenticated) {
      setPOIArr([...pOIArr, newPoI]);
    }
    // do stuff
  };

  async function setUpTrail() {
    if (trailID) {
      // fetch trail information
      return;
    }
  }

  useEffect(() => {
    setUpTrail();
  }, []);

  return (
    <View style={styles.container}>
      <SaveTrailModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <MapView
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
      ></MapView>

      {/* All user's buttons */}
      <View style={styles.btnContainer}>
        {trailID && (
          <MapButton
            label="Start Trail"
            backgroundColor="green"
            handlePress={() => Alert.alert("button press", "Start Trail")}
          />
        )}

        {/* ToDo: Figure out logic for when to display */}
        {isStarted && (
          <MapButton
            label="Show Point of Interest"
            backgroundColor="blue"
            handlePress={() =>
              Alert.alert("button press", "Show Point of Interest")
            }
          />
        )}
      </View>

      {/* Show these buttons for a logged in user */}
      {userId ? (
        <View style={styles.btnContainer}>
          {/* Only show the record buttons if there is no trailID */}

          {!trailID && !isStarted && (
            <MapButton
              label="Start"
              backgroundColor="green"
              handlePress={handleStartRecording}
            />
          )}

          {!trailID && isStarted && (
            <MapButton
              label="Stop"
              backgroundColor="red"
              handlePress={handleStopRecoding}
            />
          )}

          {!trailID && !isStarted && locationArr.length > 0 && (
            <MapButton
              label="Save"
              backgroundColor="blue"
              handlePress={handleSave}
            />
          )}

          {isStarted && (
            <MapButton
              label="Add Pt of Interest"
              backgroundColor="blue"
              handlePress={() => {
                let curLoc = currentLocation();
                let poi;
                navigation.navigate("Point of Interest", {
                  handleSetPoI,
                  trailID,
                  currentLocation: curLoc,
                });
              }}
            />
          )}
        </View>
      ) : (
        <></>
      )}
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
    bottom: 10,
  },
});
