/*
upon entry 
  1- check FG permission - if not granted display message no map access 
  2- get all trails (fgStatus===granted & trailId === undefined) 
  3- get data back display all trails

user clicks on a trail, set the trailId to that trail and focus in on it. start showing points of interest and hazards (trailId === #) using data.trailId

Authenticated user clicks on Add Trail (trailId === null), set trailId to null and start recording the trail. Show all trail data. (if trailId === null us locationArr, pOIArr)
*/

import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { getColor, getCoords } from "../utils/mapFunctions";

// Components
import MapView, { Polyline } from "react-native-maps";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import MapButton from "../components/MapButton";
import SaveTrailModal from "../components/SaveTrailModal";
import { AuthContext } from "../utils/authContext";

// Constants
import { CAMP_ALLEN_COORDS } from "../utils/constants";
const LOCATION_TASK_NAME = "background-location-task";

// Types
import { LocationObjectCoords } from "expo-location";
import { POIObj } from "../interfaces/POIObj";
import { SaveTrailData } from "../interfaces/SaveTrailData";
import useFetch from "../hooks/useFetch";
import { TrailData } from "../interfaces/TrailData";
type TrailScreenProps = StackNativeScreenProps<"Trail Screen">;
interface SubmitTrailData {
  trailId: number | null;
  name?: string;
  description?: string;
  difficulty: "easy" | "moderate" | "hard";
  isClosed: boolean;
  createdBy: number;
  TrailCoords: LocationObjectCoords[];
  // ptsOfInterest: POIObj[];
  // hazards: HazardObj[];
}

// Main function
export default function TrailScreen({ navigation, route }: TrailScreenProps) {
  // Default coordinates upon loading (Camp Allen).
  const [region, setRegion] = useState(CAMP_ALLEN_COORDS);

  const { auth } = useContext(AuthContext);
  const userId = auth.userData?.user.userId || null;

  const [trailID, setTrailID] = useState(route.params?.trailID || null);
  const [locationArr, setLocationArr] = useState<LocationObjectCoords[]>([]);
  const [pOIArr, setPOIArr] = useState<POIObj[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  useEffect(() => {
    if (isStarted) {
      console.log("Trail Recording started");
      console.log("locationArr.length: ", locationArr.length);
      console.log("modalVisible: ", modalVisible);
    }
  }, [isStarted]);

  const { fetchData, data, error, loading } = useFetch<TrailData[]>();

  // Get Permissions.
  // everyone needs foreground permissions
  // background permission is only needed for authenticated users and if
  //   !trailID. This is only necessary if the user is recording a trail.
  const [statusFG, requestFGPermission] = Location.useForegroundPermissions();
  useEffect(() => {
    if (!statusFG?.granted) {
      requestFGPermission();
    }
  }, []);
  const [statusBG, requestBGPermission] = Location.useBackgroundPermissions();
  useEffect(() => {
    if (!statusBG?.granted && !trailID) {
      requestBGPermission();
    }
  }, []);

  const createPermissionAlert = (msg: string, type: "FG" | "BG") => {
    let cb;
    console.log("\ncreatePermissionAlert\nstatusFG:", statusFG?.status);
    console.log("statusBG:", statusBG?.status);
    if (type === "FG") {
      cb = requestFGPermission;
    } else if (type === "BG") {
      cb = requestBGPermission;
    } else {
      throw new Error("createPermissionAlert: invalid type");
    }

    return Alert.alert(
      "Missing Permission",
      msg,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: cb },
      ],
      { onDismiss: cb }
    );
  };

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
            "To turn off, go back to the app and click stop recording.",
        },
      });
      // For test:
      const campAllenCoords = {
        accuracy: 6.0980000495910645,
        altitude: 1700,
        altitudeAccuracy: 1.3625929355621338,
        heading: 327.75262451171875,
        latitude: 30.24166,
        longitude: -95.95935,
        speed: 0.3030627369880676,
      };
      setLocationArr([...locationArr, campAllenCoords]);

      setIsStarted(true);
    } else {
      console.log("status: ", statusBG?.status || null);
    }
  };

  const handleStopRecoding = async () => {
    let value = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

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
    setModalVisible(true);
  };

  const doCancel = () => {
    console.log("cancel was pressed on the modal");
    // show warning dialog (modal that is on the SaveTrailModal with continue ( does the cancel) and cancel (stops the cancel))

    setModalVisible(false);
    setLocationArr([]);
    // setPOIArr([]);
  };

  const doSaveTrail = async ({
    name,
    description,
    difficulty,
    isClosed,
  }: SaveTrailData) => {
    if (userId === null) {
      throw new Error("userId is null when saving trail");
    }

    const trailData: SubmitTrailData = {
      trailId: null,
      name,
      description,
      difficulty,
      isClosed,
      createdBy: userId,
      TrailCoords: locationArr,
      // ptsOfInterest: POIObj[];
      // hazards: HazardObj[];
    };
    console.log("*** Save Data ***");
    console.log(JSON.stringify(trailData));
    console.log("\n************************************");

    const token = auth.userData?.token;

    const options: RequestInit = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cache-control": "no-cache",
      },
      body: JSON.stringify(trailData),
    };
    fetchData({ url: "trails/", options });
    setLocationArr([]);
    // setPOIArr([]);
    // alert("Trail saved");
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

  const getTrails = async () => {
    fetchData({ url: "trails" });
  };

  // fired when data changes (post fetchData)
  useEffect(() => {
    let unmounted = false;
    if (!data) return;

    // capture the error message
    if (error) console.error(error);

    return () => {
      unmounted = true;
    };
  }, [data]);

  const showTrails = () => {
    // https://github.com/react-native-maps/react-native-maps/blob/master/docs/polyline.md

    console.log("showTrails:");
    console.log(
      "\ttrailID === null && locationArr.length:",
      trailID === null && locationArr.length
    );
    console.log(`\ttrailID && dataL ${trailID && data}`);
    console.log(`\tdata: ${Boolean(data)}`);
    if (data?.length === undefined) {
      console.log(data);
    } else console.log(`\tdata.length: ${data.length}`);

    if (trailID === null && locationArr.length > 0) {
      return (
        <Polyline
          coordinates={locationArr}
          strokeColor={getColor()}
          strokeWidth={6}
        />
      );
    } else if (trailID && data) {
      const trailInfo = data.filter(
        (el: TrailData) => el.trailId === trailID
      )[0];

      return (
        <Polyline
          coordinates={getCoords(trailInfo)}
          strokeColor={getColor(trailInfo.difficulty)}
          strokeWidth={6}
        />
      );
    } else if (data) {
      console.log("data.length", data.length);
      return data.map((trailInfo) => (
        <Polyline
          key={trailInfo.trailId}
          coordinates={getCoords(trailInfo)}
          strokeColor={getColor(trailInfo.difficulty)}
          strokeWidth={6}
          tappable={true}
          onPress={() => setTrailID(trailInfo.trailId)}
        />
      ));
    }
  };

  useEffect(() => {
    getTrails();
  }, []);

  return (
    <>
      <View style={styles.bgContainer}>
        <SaveTrailModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          saveTrail={doSaveTrail}
          doCancel={doCancel}
        />

        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
        >
          {data && showTrails()}
        </MapView>
      </View>

      <View style={styles.fgContainer}>
        <Text>Trail Screen</Text>
        <Text>Trail ID: {trailID === null ? "null" : trailID}</Text>
        {/* All user's buttons */}
        <View style={styles.btnContainer}>
          <MapButton
            label="console.log(data)"
            backgroundColor="orange"
            handlePress={() => {
              const temp = data ? [...data] : [];
              console.log(temp.reverse());
              console.log(trailID);
              console.log(locationArr);
              console.log("data.length:", data?.length || "null");
            }}
          />
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
                backgroundColor="purple"
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
    </>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  fgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    // todo: figure out the proper way to account for header
    height: "100%",
    width: "100%",

    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
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
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  permissionsText: {
    padding: 10,
    color: "red",
    fontSize: 24,
    textAlign: "center",
  },
});
