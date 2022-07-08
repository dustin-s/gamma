import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import { AuthContext } from "../contexts/authContext";
import { TrailActions } from "../contexts/TrailContext/actions";
import { checkFGStatus } from "../utils/permissionHelpers";

// Components
import MapView from "react-native-maps";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import MapButton from "../components/MapButton";
import SaveTrailModal from "../components/SaveTrailModal";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginButton from "../components/LoginButton";
import AdminButtons from "../components/AdminButtons";
import styles from "../styles/Styles";

// Constants
import { CAMP_ALLEN_COORDS } from "../utils/constants";

const LOCATION_TASK_NAME = "background-location-task";
const IS_TEST = false;

// Types
import { POIObj, GotPOIObj } from "../interfaces/POIObj";
import useFetch from "../hooks/useFetch";
import { TrailData } from "../interfaces/TrailData";
import ShowTrails from "../components/ShowTrails";
import { addPOIToTrail } from "../utils/fetchHelpers";
import { SubmitTrailData } from "../interfaces/SaveTrailData";
import { useTrailContext } from "../hooks/useTrailContext";
type TrailScreenProps = StackNativeScreenProps<"Trail Screen">;

// Main function
export default function TrailScreen({ navigation, route }: TrailScreenProps) {
  // Default coordinates upon loading (Camp Allen).
  const [region, setRegion] = useState(CAMP_ALLEN_COORDS);

  // Authorization
  const { auth, setAuth } = useContext(AuthContext);
  const userId = auth.userData?.user.userId || null;
  const getToken = () => {
    const token = auth.userData?.token;
    if (!token) {
      throw Error("User not authorized");
    }
    return token;
  };

  // Information about the trail
  const { trailId, trailData, locationArr, poiArr, trailDispatch } =
    useTrailContext();

  const [gotPOI, setGotPOI] = useState<GotPOIObj>({
    newPOI: undefined,
    oldPOI: undefined,
  });
  const [gotTrailData, setGotTrailData] = useState<SubmitTrailData>();

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
  const setFGStatus = async () => {
    const status = await checkFGStatus();
    console.log("auth.fgPermissions:", status);
    await setAuth({ ...auth, fgPermissions: status });
  };

  // submitTrail
  const submitTrail = (value: SubmitTrailData) => {
    setModalVisible(false);
    setGotTrailData(value);
  };

  // save POI
  useEffect(() => {
    console.log("********** Trail Screen **********");
    console.log("Route Params:", route.params);

    if (route.params?.newPOI && data) {
      let newPOI: POIObj | undefined = undefined;
      let oldPOI: POIObj | undefined = undefined;

      if (route.params.newPOI !== "Cancel") {
        newPOI = route.params.newPOI;

        // only if a POI ID exists will there be an old POI
        if (newPOI.pointsOfInterestId && newPOI.trailId) {
          const curTrailId = newPOI.trailId;
          const curPOIId = newPOI.pointsOfInterestId;

          oldPOI = data
            .filter((el: TrailData) => el.trailId === curTrailId)[0]
            .PointsOfInterests?.filter(
              (el: POIObj) => el.pointsOfInterestId === curPOIId
            )[0];
        }
      }
      setGotPOI({ newPOI, oldPOI });
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
    trailDispatch({ type: TrailActions.ClearPOIArr });
    // setPOIArr([]);
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
    setFGStatus();
    // getTrails();
    console.log(trailData.map((td) => `${td.trailId} ${td.name}`));
  }, [trailData]);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <SaveTrailModal modalVisible={modalVisible} submitTrail={submitTrail} />

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
            setTrailId={(chosenTrailId) =>
              trailDispatch({
                type: TrailActions.SetTrailId,
                payload: chosenTrailId,
              })
            }
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
              handlePress={() =>
                trailDispatch({
                  type: TrailActions.SetTrailId,
                  payload: null,
                })
              }
            />
          )}
        </View>

        {/* Show these buttons for a logged in user */}
        <AdminButtons
          gotPOI={gotPOI}
          setGotPOI={setGotPOI}
          setModalVisible={setModalVisible}
          gotTrailData={gotTrailData}
          setGotTrailData={setGotTrailData}
          fetchData={fetchData}
        />
      </View>
    </SafeAreaView>
  );
}
