import { useState, useEffect, useContext } from "react";
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import * as Location from "expo-location";
import { AuthContext } from "../utils/authContext";
import { checkFGStatus } from "../utils/permissionHelpers";

// Components
import MapView from "react-native-maps";
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
import AdminButtons from "../components/AdminButtons";

// Constants
import { CAMP_ALLEN_COORDS } from "../utils/constants";

// Types
import { LocationObjectCoords } from "expo-location";
import { POIObj, GotPOIObj } from "../interfaces/POIObj";
import useFetch from "../hooks/useFetch";
import { TrailData } from "../interfaces/TrailData";
import ShowTrails from "../components/ShowTrails";
import { addPOIToTrail, updatePOI } from "../utils/fetchHelpers";
import { updateId } from "expo-updates";
import { SaveTrailData } from "../interfaces/SaveTrailData";
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
  const [trailId, setTrailId] = useState<number | null>(null);
  const [locationArr, setLocationArr] = useState<LocationObjectCoords[]>([]);
  const [poiArr, setPOIArr] = useState<POIObj[]>([]);

  const [gotPOI, setGotPOI] = useState<GotPOIObj>({
    newPOI: undefined,
    oldPOI: undefined,
  });
  const [gotTrailData, setGotTrailData] = useState<
    SaveTrailData | "Cancel" | undefined
  >(undefined);
  // Display options and Recording options
  const [modalVisible, setModalVisible] = useState(false);

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
  const submitTrail = (value: SaveTrailData | "Cancel") => {
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
    setFGStatus();
    getTrails();
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <SaveTrailModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        submitTrail={submitTrail}
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

      {/* login button is relative to map */}
      <View style={[styles.loginBtnContainer]}>
        {/* Login */}
        {!auth.isAuthenticated && (
          <LoginButton onPress={() => navigation.navigate("Admin")} />
        )}
        {/*Change Password*/}
        {userId && (
          <LoginButton onPress={() => navigation.navigate("Update Password")} />
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
            label="Home"
            backgroundColor="orange"
            handlePress={() => navigation.navigate("Home")}
          />
          <MapButton
            label="refresh"
            backgroundColor="orange"
            handlePress={getTrails}
          />
        </View>

        {/* All user's buttons */}
        <View style={styles.btnContainer}>
          {trailId && (
            <MapButton
              label="Back"
              backgroundColor="green"
              handlePress={() => setTrailId(null)}
            />
          )}
          {trailId && (
            <MapButton
              label="Start Trail"
              backgroundColor="green"
              handlePress={() => Alert.alert("button press", "Start Trail")}
            />
          )}
        </View>

        {/* Show these buttons for a logged in user */}
        <AdminButtons
          trailId={trailId}
          setTrailId={setTrailId}
          locationArr={locationArr}
          setLocationArr={setLocationArr}
          poiArr={poiArr}
          setPOIArr={setPOIArr}
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
    flexWrap: "wrap",
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
