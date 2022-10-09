import { useState, useEffect } from "react";
import { useTrailContext } from "../hooks/useTrailContext";
import { useAuthentication } from "../hooks/useAuthentication";

import { getTrails } from "../utils/fetchHelpers";
import styles from "../styles/Styles";

import MapView from "react-native-maps";
import { ActivityIndicator, Text, View } from "react-native";
import MapButton from "../components/MapButton";
import SaveTrailModal from "../components/SaveTrailModal";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginButton from "../components/LoginButton";
import AdminButtons from "../components/AdminButtons";
import ShowTrails from "../components/ShowTrails";
import TrailKey from "../components/TrailKey";

import { StackNativeScreenProps } from "../interfaces/StackParamList";
import { TrailData } from "../interfaces/TrailData";
import { SubmitTrailData } from "../interfaces/SaveTrailData";

import { CAMP_ALLEN_COORDS } from "../utils/constants";

type TrailScreenProps = StackNativeScreenProps<"Trail Screen">;

export default function TrailScreen({ navigation, route }: TrailScreenProps) {
  const [region, setRegion] = useState(CAMP_ALLEN_COORDS);

  const { isAuthenticated, userId, setFGStatus } = useAuthentication();

  const { trailId, trailList, trailDispatch, TrailActions } = useTrailContext();

  const [gotTrailData, setGotTrailData] = useState<SubmitTrailData>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFGStatus();
  }, []);

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
    setError(route.params?.errMsg || "");
  }, [route]);

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
        {!isAuthenticated && (
          <LoginButton onPress={() => navigation.navigate("Admin")} />
        )}
        {userId && (
          <LoginButton onPress={() => navigation.navigate("Update Password")} />
        )}
      </View>

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
