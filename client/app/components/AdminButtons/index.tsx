import { SetStateAction, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { checkFGStatus } from "../../utils/permissionHelpers";
import { StyleSheet, View } from "react-native";
import MapButton from "../MapButton";
import { addPOIToTrail, updatePOI } from "../../utils/fetchHelpers";

import { AuthContext } from "../../contexts/authContext";
import { TrailContext } from "../../contexts/TrailContext";
import { TrailActions } from "../../contexts/TrailContext/actions";

import { LocationObject } from "expo-location";
import { GotPOIObj } from "../../interfaces/POIObj";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNativeScreenProps } from "../../interfaces/StackParamList";
import { SaveTrailData, SubmitTrailData } from "../../interfaces/SaveTrailData";

import useFetch from "../../hooks/useFetch";
import { useTrailContext } from "../../hooks/useTrailContext";

const LOCATION_TASK_NAME = "background-location-task";

interface AdminButtonsProps {
  gotPOI: GotPOIObj;
  setGotPOI(value: SetStateAction<GotPOIObj>): void;
  gotTrailData: SubmitTrailData;
  setGotTrailData(value: SetStateAction<SubmitTrailData>): void;
  setModalVisible(value: SetStateAction<boolean>): void;
  fetchData: any;
}

export default function AdminButtons({
  gotPOI, // <-- can we get the route params directly? Move that whole use effect here?
  setGotPOI,
  setModalVisible, // <-- Can we pull the modal in to this screen?
  // fetchData, <-- change this to use trailContext
  gotTrailData,
  setGotTrailData,
}: AdminButtonsProps) {
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

  // const { trailState, trailDispatch } = useContext(TrailContext);
  const { trailId, trailData, locationArr, poiArr, trailDispatch } =
    useTrailContext();

  const navigation =
    useNavigation<StackNativeScreenProps<"Point of Interest">["navigation"]>();
  const routes = useRoute<StackNativeScreenProps<"Trail Screen">["route"]>();

  const { fetchData } = useFetch();

  // recording status
  const [addingTrail, setAddingTrail] = useState(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [pauseRecording, setPauseRecording] = useState(false);

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
    const location: LocationObject[] = curData.locations as LocationObject[];
    const curLoc = location[location.length - 1];
    if (!pauseRecording) {
      trailDispatch({ type: TrailActions.AddLocation, payload: curLoc.coords });
    }

    console.log("pauseRecording:", pauseRecording);
    console.log("\nlocation length=", locationArr.length);
    console.log(`time:  ${new Date(curLoc.timestamp).toLocaleString()}`);
    console.log("last location:\n", location);
  });

  const handleStartRecording = async () => {
    console.log("handleStartRecording");
    if (auth.fgPermissions) {
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

      // ensure trailId is not set
      trailDispatch({ type: TrailActions.SetTrailId, payload: null });
      setIsRecording(true);
      console.log("started recording");
    } else {
      console.log("handleStartRecording: statusFG:", auth.fgPermissions);
      await checkFGStatus();
    }
  };

  const handleStopRecording = async () => {
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

  const doCancel = () => {
    console.log("cancel was pressed on the modal");

    trailDispatch({ type: TrailActions.ClearLocations });
    trailDispatch({ type: TrailActions.ClearPOIArr });
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

    trailDispatch({ type: TrailActions.ClearLocations });
    setAddingTrail(false);
    // alert("Trail saved");
  };

  const savePOI = async () => {
    console.log("***** Save POI *****");
    try {
      // resume recording (if needed)
      if (addingTrail) {
        setPauseRecording(false);
      }

      const { newPOI, oldPOI } = gotPOI;
      console.log("newPOI:\n", newPOI);

      // no POI to add (route returned "Cancel")
      if (!newPOI) return;

      const token = getToken();

      if (oldPOI) {
        // has both a POI ID and TRail ID
        console.log("***** Update POI *****");
        console.log("Old POI:\n", oldPOI);
        await updatePOI(newPOI, oldPOI, token);
      } else if (newPOI.trailId) {
        // doesn't have a POI ID
        console.log("***** Add New POI to Trail *****");
        console.log("Trail Id:", newPOI.trailId);
        await addPOIToTrail(newPOI, token);
      } else {
        // if new trail...
        console.log("Add POI to array");
        trailDispatch({ type: TrailActions.AddPOI, payload: newPOI });
        return;
      }
      setGotPOI({ newPOI: undefined, oldPOI: undefined });
      await fetchData({ url: "trails" });
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log("*********************************************");
    console.log(
      "Admin Buttons: routes.params?.newPOI",
      routes.params?.newPOI || "null"
    );
    console.log("*********************************************");
    savePOI();
  }, [gotPOI]);

  useEffect(() => {
    if (!gotTrailData) return;

    if (gotTrailData !== "Closed") {
      if (gotTrailData === "Cancel") {
        doCancel();
      } else {
        doSaveTrail(gotTrailData);
      }
    }
    setGotTrailData(undefined);
  }, [gotTrailData]);

  //
  //
  //

  // forTest:
  useEffect(() => {
    if (isRecording || !pauseRecording) {
      console.log("isRecording:", isRecording);
      console.log("pauseRecoding:", pauseRecording);
      console.log("Trail Recording started");
      console.log("locationArr.length: ", locationArr.length);
    } else {
      console.log("Recording Stopped");
      console.log("isRecording:", isRecording);
      console.log("pauseRecoding:", pauseRecording);
    }
  }, [isRecording, pauseRecording]);

  //
  //
  //

  if (!auth.userData?.user.userId) {
    return null;
  }
  return (
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
              handlePress={handleStopRecording}
            />
          )}

          {!isRecording && locationArr.length > 1 && (
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
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    width: "100%",
    margin: 10,
  },
});
