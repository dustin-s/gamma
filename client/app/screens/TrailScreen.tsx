import { useState, useEffect } from "react";
import { useTrailContext } from "../hooks/useTrailContext";
import { useAuthentication } from "../hooks/useAuthentication";

// helpers/styles
import { getTrails } from "../utils/fetchHelpers";
import styles from "../styles/Styles";

// Components
import MapView from "react-native-maps";

import { ActivityIndicator, Text, View } from "react-native";

import MapButton from "../components/MapButton";
import SaveTrailModal from "../components/SaveTrailModal";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginButton from "../components/LoginButton";
import AdminButtons from "../components/AdminButtons";
import ShowTrails from "../components/ShowTrails";
import TrailKey from "../components/TrailKey";

// Types/Interfaces
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import { TrailData } from "../interfaces/TrailData";
import { SubmitTrailData } from "../interfaces/SaveTrailData";

// Constants
import { CAMP_ALLEN_COORDS } from "../utils/constants";

const IS_TEST = true;

type TrailScreenProps = StackNativeScreenProps<"Trail Screen">;

// Main function
export default function TrailScreen({ navigation, route }: TrailScreenProps) {
  // Default coordinates upon loading (Camp Allen).
  const [region, setRegion] = useState(CAMP_ALLEN_COORDS);

  // Authorization
  const { isAuthenticated, userId, setFGStatus } = useAuthentication();

  // Information about the trail
  const {
    trailId,
    trailList,
    poiArr, // only used in console.log button
    trailDispatch,
    TrailActions,
  } = useTrailContext();

  const [gotTrailData, setGotTrailData] = useState<SubmitTrailData>(null);

  // Display options
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get Permissions.
  useEffect(() => {
    setFGStatus();
  }, []);

  // submitTrail
  const submitTrail = (value: SubmitTrailData) => {
    setModalVisible(false);
    setGotTrailData(value);
  };

  function fetchTrails() {
    setIsLoading(true);
    getTrails<TrailData[]>()
      .then((data) => {
        trailDispatch({ type: TrailActions.SetAllTrails, payload: data });
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchTrails();
  }, []);

  useEffect(() => {
    console.log("Route useEffect", { route });
    setError(route.params?.errMsg || "");
  }, [route]);

  useEffect(() => {
    console.log("trailList updated");
  }, [trailList]);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <SaveTrailModal modalVisible={modalVisible} submitTrail={submitTrail} />

      {isLoading && <ActivityIndicator size="large" />}

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {trailList && (
          <ShowTrails
            setTrailId={(chosenTrailId) =>
              trailDispatch({
                type: TrailActions.SetTrailId,
                payload: chosenTrailId,
              })
            }
          />
        )}
      </MapView>

      <View style={[styles.mapKeyContainer]}>
        <TrailKey />
      </View>

      <View style={[styles.loginBtnContainer]}>
        {/* Login */}
        {!isAuthenticated && (
          <LoginButton onPress={() => navigation.navigate("Admin")} />
        )}
        {/*Change Password/Logout*/}
        {userId && (
          <LoginButton onPress={() => navigation.navigate("Update Password")} />
        )}
      </View>

      {/* Other button containers are at the bottom of the screen */}
      <View style={[styles.fgContainer]}>
        {error !== "" && <Text style={styles.errText}>{error}</Text>}
        <Text style={styles.permissionsText}>
          {trailId
            ? `Trail Name: ${
                trailList?.filter((td: TrailData) => td.trailId === trailId)[0]
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
                console.log("*************");
                console.log("userId: ", userId);
                console.log("trailId:", trailId);
                console.log("trailList.length:", trailList?.length || "null");
                console.log("poiArr.length", poiArr.length);
                !trailId ? (
                  <>
                    {console.log("trails")}
                    {trailList?.map((trail) =>
                      console.log(
                        `${trail.trailId}\t${trail.difficulty}\t${
                          trail.difficulty !== "moderate" ? "\t" : ""
                        }${trail.name}`
                      )
                    )}
                  </>
                ) : (
                  <>
                    {console.log("POIs")}
                    {trailList
                      .filter((trail) => trail.trailId === trailId)[0]
                      .PointsOfInterests?.map((poi) =>
                        console.log(
                          `${poi.pointsOfInterestId}\t${poi.isActive}\t${poi.description}`
                        )
                      )}
                  </>
                );
              }}
            />
            <MapButton
              label="refresh"
              backgroundColor="orange"
              handlePress={() => {
                setError("");
                setGotTrailData("Cancel");
                fetchTrails();
              }}
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
          setModalVisible={setModalVisible}
          gotTrailData={gotTrailData}
          setGotTrailData={setGotTrailData}
          setIsLoading={setIsLoading}
          setError={setError}
        />
      </View>
    </SafeAreaView>
  );
}
