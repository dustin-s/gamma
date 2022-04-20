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
import { AuthContext } from "../utils/authContext";

// Components
import MapView, { Polyline } from "react-native-maps";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapButton from "../components/MapButton";
import SaveTrailModal from "../components/SaveTrailModal";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginButton from "../components/LoginButton";

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

// https://www.carlrippon.com/6-useful-typescript-3-features-you-need-to-know/ clarifies how omit works. This will grow with trail data, but those fields won't be required. In this instance they are all set by the server.
type SubmitTrailData = Omit<
  TrailData,
  "trailId" | "distance" | "hasNatureGuide" | "hasHazard"
>;

// Main function
export default function TrailScreen({ navigation, route }: TrailScreenProps) {
  // Default coordinates upon loading (Camp Allen).
  const [region, setRegion] = useState(CAMP_ALLEN_COORDS);

  const { auth } = useContext(AuthContext);
  const userId = auth.userData?.user.userId || null;

  const [trailId, setTrailID] = useState(route.params?.trailID || null);
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
      console.log("requestFGPermission");
      requestFGPermission();
    }
  }, []);

  // removing BGPermissions based on comment made by "byCedric" on Oct 18, 2021 in https://github.com/expo/expo/issues/14774
  // const [statusBG, requestBGPermission] = Location.useBackgroundPermissions();

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
    if (statusFG?.granted) {
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
      if (locationArr.length === 0) {
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
      }

      setTrailID(null); // ensure trailId is not set
      setIsStarted(true);
    } else {
      console.log("handleStartRecording: statusFG:", statusFG?.status || null);
      await requestFGPermission();
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

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("difficulty", difficulty);
    formData.append("isClosed", isClosed.toString());
    formData.append("createdBy", userId.toString());
    for (let location of locationArr) {
      for (const [key, value] of Object.entries(location)) {
        formData.append(`TrailCoords_${key}`, value?.toString() ?? "");
      }
    }
    // ptsOfInterest: POIObj[];
    // hazards: HazardObj[];

    console.log("*** Save Data ***");
    console.log(formData);
    console.log("\n************************************");

    const token = auth.userData?.token;

    const options: RequestInit = {
      method: "POST",
      headers: {
        Accept: "multipart/form-data",
        "Cache-control": "no-cache",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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

    // console.log("showTrails:");
    // console.log(
    //   "\ttrailID === null && locationArr.length:",
    //   trailID === null && locationArr.length
    // );
    // console.log(`\ttrailID && data: ${trailID && Boolean(data)}`);
    // console.log(`\tdata: ${Boolean(data)}`);
    // if (data?.length === undefined) {
    //   console.log(data);
    // } else console.log(`\tdata.length: ${data.length}`);

    if (trailId === null && locationArr.length > 0) {
      return (
        <Polyline
          coordinates={locationArr}
          strokeColor={getColor()}
          strokeWidth={6}
        />
      );
    } else if (trailId && data) {
      const trailInfo = data.filter(
        (el: TrailData) => el.trailId === trailId
      )[0];

      return (
        <Polyline
          coordinates={getCoords(trailInfo)}
          strokeColor={getColor(trailInfo.difficulty)}
          strokeWidth={6}
        />
      );
    } else if (data) {
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
    <SafeAreaView style={styles.safeAreaView}>
      <SaveTrailModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        saveTrail={doSaveTrail}
        doCancel={doCancel}
      />

      {loading && <ActivityIndicator size="large" />}

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {data && showTrails()}
      </MapView>

      {/* login button is relative to map */}
      <View style={[styles.loginBtnContainer]}>
        {!auth.isAuthenticated && (
          <LoginButton onPress={() => navigation.navigate("Admin")} />
        )}
      </View>

      {/* Other button containers are at the bottom of the screen */}
      <View style={[styles.fgContainer]}>
        <Text>Trail Screen</Text>
        <Text>Trail ID: {trailId === null ? "null" : trailId}</Text>

        {/* Debug buttons */}
        <View style={styles.btnContainer}>
          <MapButton
            label="console.log(data)"
            backgroundColor="orange"
            handlePress={() => {
              console.log("\n*************");
              // const temp = data ? [...data] : [];
              // console.log(temp.reverse());
              // console.log(locationArr);
              console.log("userId: ", userId);
              console.log("trailId:", trailId);
              console.log("data.length:", data?.length || "null");
              console.log("locationArr.length: ", locationArr.length);
              console.log("trails");
              data?.forEach((trail) =>
                console.log(
                  `${trail.trailId}\t${trail.difficulty}\t${trail.name}`
                )
              );
              // console.log("statusFG:", statusFG);
            }}
          />
          <MapButton
            label="Home"
            backgroundColor="orange"
            handlePress={() => navigation.navigate("Home")}
          />
        </View>

        {/* All user's buttons */}
        <View style={styles.btnContainer}>
          {trailId && (
            <MapButton
              label="Back"
              backgroundColor="green"
              handlePress={() => setTrailID(null)}
            />
          )}
          {trailId && (
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
            {!isStarted && (
              <MapButton
                label={locationArr.length > 0 ? "Start" : "Add Trail"}
                backgroundColor={locationArr.length > 0 ? "green" : "blue"}
                handlePress={handleStartRecording}
              />
            )}

            {!trailId && isStarted && (
              <MapButton
                label="Stop"
                backgroundColor="red"
                handlePress={handleStopRecoding}
              />
            )}

            {!trailId && !isStarted && locationArr.length > 0 && (
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
                    trailID: trailId,
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  loginBtnContainer: {
    position: "absolute",

    right: 10,
    top: Platform.OS === "ios" ? 35 : 110,

    zIndex: 3, // for iOS
    elevation: 3, // for Android
  },

  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    margin: 10,
  },

  permissionsText: {
    padding: 10,
    color: "red",
    fontSize: 24,
    textAlign: "center",
  },
});
