import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import MapView from "react-native-maps";
import { Alert, Dimensions, StyleSheet, View } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

// Components
import MapButton from "../components/MapButton";
import { LocationObject, LocationObjectCoords } from "expo-location";
import { AuthContext } from "../utils/authContext";

// Constants
const LOCATION_TASK_NAME = "background-location-task";

// Types
type ScreenProps = StackNativeScreenProps<"Trail Screen">;
type TrailScreenProps = ScreenProps & { trailID?: number | null };

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

// Main function
export default function TrailScreen({ navigation, trailID }: TrailScreenProps) {
  // Default coordinates upon loading (Camp Allen).
  const [location, setLocation] = useState({
    latitude: 30.24166,
    longitude: -95.95935,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

  const { auth } = useContext(AuthContext);
  let userId: number | null = null;
  if (auth.userData?.user) {
    userId = auth.userData.user.userId;
  }

  const [trailId, setTrailID] = useState(trailID ? trailID : null);
  const [locationArr, setLocationArr] = useState<LocationObjectCoords[]>([]);
  const [pOIArr, setPOIArr] = useState([]);

  const [isStarted, setIsStarted] = useState<boolean>(false);

  // Define the task passing its name and a callback that will be called whenever the location changes
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }

    const locations = data as LocationObject[];
    console.log("locations:", locations);

    const [location] = locations;

    setLocationArr([...locationArr, location.coords]);

    console.log("location length=", locationArr.length);
    console.log(`time:  ${new Date(location.timestamp).toLocaleString()}`);
    console.log("last location: ", location);
  });

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
    setPOIArr([]);
    alert("Trail saved");
  };

  const currentLocation = () => {
    if (trailID) {
      // return the current location on the trail
    } else {
      return locationArr[locationArr.length - 1];
    }
  };
  const handleSetPoI = (newPoI: POIObj) => {
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
          {!trailID ? (
            <>
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
            </>
          ) : (
            <></>
          )}

          {isStarted && (
            <MapButton
              label="Add Point of Interest"
              backgroundColor="blue"
              handlePress={() => {
                let curLoc = currentLocation();
                // navigation.navigate("Point of Interest", {
                //   handleSetPoI,
                //   trailID,
                //   userID,
                //   curLoc,
                // });
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
    bottom: 0,
  },
});
