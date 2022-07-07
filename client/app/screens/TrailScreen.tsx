import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { AuthContext } from "../utils/authContext";
import { checkStatus } from "../utils/permissionHelpers";

// Components
import MapView from "react-native-maps";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import MapButton from "../components/MapButton";
import SaveTrailModal from "../components/SaveTrailModal";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginButton from "../components/LoginButton";
import styles from "../styles/Styles";

// Constants
import { CAMP_ALLEN_COORDS } from "../utils/constants";
const LOCATION_TASK_NAME = "background-location-task";
const IS_TEST = false;

// Types
import { LocationObjectCoords } from "expo-location";
import { POIObj } from "../interfaces/POIObj";
import { SaveTrailData } from "../interfaces/SaveTrailData";
import useFetch from "../hooks/useFetch";
import { TrailData } from "../interfaces/TrailData";
import ShowTrails from "../components/ShowTrails";
import { addPOIToTrail, updatePOI } from "../utils/fetchHelpers";
type TrailScreenProps = StackNativeScreenProps<"Trail Screen">;

// Main function
export default function TrailScreen({ navigation, route }: TrailScreenProps) {
  // Default coordinates upon loading (Camp Allen).
  const [region, setRegion] = useState(CAMP_ALLEN_COORDS);

  // Authorization
  const { auth } = useContext(AuthContext);
  const userId = auth.userData?.user.userId || null;
  const getToken = () => {
    const token = auth.userData?.token;
    if (!token) {
      throw Error("User not authorized");
    }
    return token;
  };

  // Information about the trail
  const [trailId, setTrailId] = useState<number | null>(null);
  const [locationArr, setLocationArr] = useState<LocationObjectCoords[]>([]);
  const [poiArr, setPOIArr] = useState<POIObj[]>([]);

  // Display options and Recording options
  const [modalVisible, setModalVisible] = useState(false);
  const [addingTrail, setAddingTrail] = useState(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [pauseRecording, setPauseRecording] = useState(false);
  // forTest:
  useEffect(() => {
    if (!IS_TEST) return;
    if (isRecording || !pauseRecording) {
      console.log("isRecording:", isRecording);
      console.log("pauseRecoding:", pauseRecording);
      console.log("Trail Recording started");
      console.log("locationArr.length: ", locationArr.length);
      console.log("modalVisible: ", modalVisible);
    } else {
      console.log("Recording Stopped");
      console.log("isRecording:", isRecording);
      console.log("pauseRecoding:", pauseRecording);
    }
  }, [isRecording, pauseRecording]);

  const { fetchData, data, error, loading } = useFetch<TrailData[]>();

  // Get Permissions.
  // everyone needs foreground permissions
  // background permission are not request based on based on comment made
  //  by "byCedric" on Oct 18, 2021 in https://github.com/expo/expo/issues/14774
  const [statusFG, requestFGPermission] = Location.useForegroundPermissions();
  useEffect(() => {
    if (!checkStatus(statusFG)) {
      // console.log("requestFGPermission");
      requestFGPermission();
    }
  }, []);

  const handleAddTrail = () => {
    setAddingTrail(true);
    handleStartRecording();
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
    if (!pauseRecording) {
      setLocationArr([...locationArr, location.coords]);
    }

    console.log("pauseRecording:", pauseRecording);
    console.log("\nlocation length=", locationArr.length);
    console.log(`time:  ${new Date(location.timestamp).toLocaleString()}`);
    console.log("last location:\n", location);
  });

  const handleStartRecording = async () => {
    console.log("handleStartRecording");
    if (checkStatus(statusFG)) {
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

      setTrailId(null); // ensure trailId is not set
      setIsRecording(true);
      console.log("started recording");
    } else {
      console.log(
        "handleStartRecording: statusFG:",
        statusFG ? checkStatus(statusFG) : null
      );
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
      console.log(
        `There were ${locationArr.length} entries in the location array.`
      );
      console.log(`There were ${poiArr.length} entries in the POI array.`);
      console.log("\n************************************");

      setIsRecording(false);
    }
  };

  const handleSave = () => {
    setModalVisible(true);
  };

  const doCancel = () => {
    console.log("cancel was pressed on the modal");

    setModalVisible(false);
    setLocationArr([]);
    setPOIArr([]);
    setAddingTrail(false);
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
    setAddingTrail(false);
    // alert("Trail saved");
  };

  const currentLocation = async () => {
    if (addingTrail) {
      // return the current location on the trail
      return locationArr[locationArr.length - 1];
    } else {
      const curLoc = await Location.getCurrentPositionAsync();
      return curLoc.coords;
    }
  };

  const handleAddPOI = async () => {
    const curLoc = await currentLocation();
    console.log("***** Handle Add POI *****");
    console.log("curLoc:", curLoc);

    if (addingTrail) {
      setPauseRecording(true);
    }

    navigation.navigate("Point of Interest", {
      currentLocation: curLoc,
      trailId,
    });
  };

  const savePOI = async (newPOI: POIObj) => {
    console.log("***** Save POI *****\nnewPOI:");
    console.log(newPOI);

    // resume recording (if needed)
    if (addingTrail) {
      setPauseRecording(false);
    }

    const token = getToken();

    // if new trail...
    if (!newPOI.trailId) {
      console.log("Add POI to array");
      setPOIArr([...poiArr, newPOI]);
      return;
    }

    try {
      // if POI already exists
      if (newPOI.pointsOfInterestId && data) {
        console.log("***** Update POI *****");

        const oldPOI = data
          .filter((el: TrailData) => el.trailId === trailId)[0]
          .PointsOfInterests?.filter(
            (el: POIObj) => el.pointsOfInterestId === newPOI.pointsOfInterestId
          )[0];
        console.log("Old POI:\n", oldPOI);

        if (oldPOI) {
          await updatePOI(newPOI, oldPOI, token);
        }
      } else if (newPOI.trailId && data) {
        console.log("***** Add New POI to Trail *****");
        console.log("Trail Id:", newPOI.trailId);
        await addPOIToTrail(newPOI, token);
      }
      getTrails();
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log("********** Trail Screen **********");
    console.log("Route Params:", route.params);
    if (route.params?.newPOI) {
      if (route.params.newPOI === "Cancel") {
        if (addingTrail) {
          setPauseRecording(false);
        }
      } else {
        savePOI(route.params.newPOI);
      }
    }
  }, [route.params?.newPOI]);

  const getTrails = async () => {
    await fetchData({ url: "trails" });
  };

  const addNewPOIs = async (newTrailId: number) => {
    const token = getToken();

    for (let i = 0; i < poiArr.length; i++) {
      const point = poiArr[i];
      point.trailId = newTrailId;
      await addPOIToTrail(point, token);
    }
    setPOIArr([]);
    getTrails();
  };

  // fired when data changes (post fetchData)
  useEffect(() => {
    let unmounted = false;
    if (!data) return;

    // capture the error message
    if (error) {
      console.error(error);
      return;
    }

    if (poiArr.length > 0) {
      const newTrailId = data[data.length - 1].trailId;

      addNewPOIs(newTrailId!);
    }

    return () => {
      unmounted = true;
    };
  }, [data]);

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
        {data && (
          <ShowTrails
            data={data}
            locationArr={locationArr}
            trailId={trailId}
            setTrailId={setTrailId}
          />
        )}
      </MapView>

      <View style={[styles.loginBtnContainer]}>
        {/* Login */}
        {!auth.isAuthenticated && (
          <LoginButton onPress={() => navigation.navigate("Admin")} />
        )}
        {/*Change Password/Logout*/}
        {userId && (
          <LoginButton onPress={() => navigation.navigate("Update Password")} />
        )}
      </View>

      {/* Other button containers are at the bottom of the screen */}
      <View style={[styles.fgContainer]}>
        <Text style={styles.permissionsText}>
          {trailId
            ? `Trail Name: ${
                data?.filter((td: TrailData) => td.trailId === trailId)[0]
                  .name || ""
              }`
            : `Select a trail to get started.`}
        </Text>

        {/* Debug buttons */}
        {IS_TEST && (
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
                console.log("poiArr.length", poiArr.length);
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
              label="refresh"
              backgroundColor="orange"
              handlePress={getTrails}
            />
          </View>
        )}

        {/* All user's buttons */}
        <View style={styles.btnContainer}>
          {trailId && (
            <MapButton
              label="Back"
              backgroundColor="green"
              handlePress={() => setTrailId(null)}
            />
          )}
        </View>

        {/* Show these buttons for a logged in user */}
        {userId && (
          <View>
            <View style={styles.btnContainer}>
              {!addingTrail ? (
                <MapButton
                  label="Add Trail"
                  handlePress={handleAddTrail}
                  backgroundColor="blue"
                />
              ) : (
                <>
                  {!isRecording && (
                    <MapButton
                      label="Start"
                      backgroundColor="green"
                      handlePress={handleStartRecording}
                    />
                  )}

                  {isRecording && (
                    <MapButton
                      label="Stop"
                      backgroundColor="red"
                      handlePress={handleStopRecoding}
                    />
                  )}

                  {!isRecording && locationArr.length > 0 && (
                    <MapButton
                      label="Save"
                      backgroundColor="blue"
                      handlePress={handleSave}
                    />
                  )}
                </>
              )}
              {(addingTrail || trailId) && (
                <MapButton
                  label="Add Pt of Interest"
                  backgroundColor="purple"
                  handlePress={handleAddPOI}
                />
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
