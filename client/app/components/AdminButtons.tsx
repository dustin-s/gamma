import { SetStateAction, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { checkFGStatus } from "../../utils/permissionHelpers";
import { View } from "react-native";
import MapButton from "../MapButton";
import {
  addPOIToTrail,
  changeToFormData,
  getTrails,
  updatePOI,
} from "../../utils/fetchHelpers";

import { AuthContext } from "../../contexts/authContext";
import { TrailActions } from "../../contexts/TrailContext/actions";

import { LocationObject } from "expo-location";
import { POIObj } from "../../interfaces/POIObj";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNativeScreenProps } from "../../interfaces/StackParamList";
import { SaveTrailData, SubmitTrailData } from "../../interfaces/SaveTrailData";

import useFetch from "../../hooks/useFetch";
import { useTrailContext } from "../../hooks/useTrailContext";
import styles from "../../styles/Styles";
import { BASE_API } from "../../utils/constants";
import { guardDataType } from "../../utils/typeGuard";
import { TrailData } from "../../interfaces/TrailData";
import { useAuthentication } from "../../hooks/useAuthentication";

const LOCATION_TASK_NAME = "background-location-task";

interface AdminButtonsProps {
  gotTrailData: SubmitTrailData;
  setGotTrailData(value: SetStateAction<SubmitTrailData>): void;
  setModalVisible(value: SetStateAction<boolean>): void;
  setIsLoading(value: SetStateAction<boolean>): void;
  setError(value: SetStateAction<string>): void;
}

export default function AdminButtons({
  setModalVisible, // <-- Can we pull the modal in to this screen?
  gotTrailData,
  setGotTrailData,
  setIsLoading,
  setError,
}: AdminButtonsProps) {
  // Authorization
  const { getToken, userId, fgPermissions, isAuthenticated } =
    useAuthentication();

  const { trailId, trailList, locationArr, poiArr, trailDispatch } =
    useTrailContext();

  const navigation =
    useNavigation<StackNativeScreenProps<"Point of Interest">["navigation"]>();
  const route = useRoute<StackNativeScreenProps<"Trail Screen">["route"]>();

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
      console.log(curLoc.coords);
      trailDispatch({
        type: TrailActions.AddLocation,
        payload: curLoc.coords,
      });
    }
  });

  const handleStartRecording = async () => {
    if (fgPermissions) {
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
    } else {
      await checkFGStatus();
    }
  };

  const handleStopRecording = async () => {
    let value = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

    if (value) {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

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

    if (addingTrail) {
      setPauseRecording(true);
    }

    navigation.navigate("Point of Interest", {
      currentLocation: curLoc,
      trailId,
    });
  };

  const doCancel = () => {
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
    try {
      if (userId === null) {
        throw new Error("userId is null when saving trail");
      }

      const formData = await changeToFormData({
        name,
        description,
        difficulty,
        isClosed,
        createdBy: userId,
        TrailCoords: locationArr,
      });

      const token = getToken();

      const options: RequestInit = {
        method: "POST",
        headers: {
          Accept: "multipart/form-data",
          "Cache-control": "no-cache",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      };

      // save trail data (get trail back and append to trail)
      const response = await fetch(BASE_API + "trails", options);
      const data = response.json() as any;

      if (data.error) {
        console.log("Save trail data.error", data.error);
        throw new Error(data.error);
      }

      console.log("Save trails success...");
      const newTrail: TrailData = guardDataType<TrailData>(data);
      console.log("Save trails guardDataType success...");

      if (poiArr.length > 0) {
        console.log("Save trails, saving POIs...");
        const newTrailId = newTrail.trailId;

        for (let i = 0; i < poiArr.length; i++) {
          // add each POI to the DB
          const point = poiArr[i];
          point.trailId = newTrailId;
          const newPOI = await addPOIToTrail(point, token);

          // add each POI to the new trail
          newTrail.PointsOfInterests?.push(newPOI);
        }
      }
      trailDispatch({ type: TrailActions.ClearPOIArr });
      trailDispatch({ type: TrailActions.ClearLocations });
      trailDispatch({ type: TrailActions.AddTrail, payload: newTrail });

      setAddingTrail(false);
      setIsLoading(false);
    } catch (err: any) {
      console.log(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  // route
  useEffect(() => {
    if (!route.params?.status && !route.params?.errMsg) {
      return;
    }

    const { status, errMsg } = route.params;
    if (status !== "cancel" && !errMsg) {
      setPauseRecording(false);
    }
    if (errMsg) {
      setError(errMsg);
    }
  }, [route]);

  // save trails
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

  useEffect(() => {
    console.log({ addingTrail });
  }, [addingTrail]);
  useEffect(() => {
    console.log({ isRecording });
  }, [isRecording]);
  useEffect(() => {
    console.log({ pauseRecording });
  }, [pauseRecording]);

  if (!isAuthenticated) {
    return null;
  }
  return (
    <View style={[styles.btnContainer, { flexWrap: "wrap" }]}>
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
