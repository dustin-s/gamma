import { SetStateAction, useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { checkFGStatus } from "../../utils/permissionHelpers";
import { Text, View } from "react-native";
import StartButton from "./StartButton";
import StopButton from "./StopButton";
import SaveButton from "./SaveButton";
import MapButton from "../MapButton";
import { addPOIToTrail, changeToFormData } from "../../utils/fetchHelpers";
import { guardDataType } from "../../utils/typeGuard";

import { TrailActions } from "../../contexts/TrailContext/actions";
import { useAuthentication } from "../../hooks/useAuthentication";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTrailContext } from "../../hooks/useTrailContext";

import { LocationObject } from "expo-location";
import { StackNativeScreenProps } from "../../interfaces/StackParamList";
import { SaveTrailData, SubmitTrailData } from "../../interfaces/SaveTrailData";
import { TrailData } from "../../interfaces/TrailData";

import styles from "../../styles/Styles";
import { BASE_API } from "../../utils/constants";
import POIButton from "./POIButton";

const LOCATION_TASK_NAME = "background-location-task";

interface AdminButtonsProps {
  gotTrailData: SubmitTrailData;
  setGotTrailData(value: SetStateAction<SubmitTrailData>): void;
  setModalVisible(value: SetStateAction<boolean>): void;
  setIsLoading(value: SetStateAction<boolean>): void;
  setError(value: SetStateAction<string>): void;
}

export default function AdminButtons({
  setModalVisible,
  gotTrailData,
  setGotTrailData,
  setIsLoading,
  setError,
}: AdminButtonsProps) {
  const { getToken, userId, fgPermissions, isAuthenticated } =
    useAuthentication();

  const { trailId, locationArr, poiArr, trailDispatch } = useTrailContext();

  const navigation =
    useNavigation<StackNativeScreenProps<"Point of Interest">["navigation"]>();
  const route = useRoute<StackNativeScreenProps<"Trail Screen">["route"]>();

  // recording status
  const [isAddingTrail, setAddingTrail] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Define the task passing its name and a callback that will be called whenever the location changes
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      setError(error.message);
      return;
    }
    const curData = data as any;

    const location: LocationObject[] = curData.locations as LocationObject[];
    const curLoc = location[location.length - 1];
    if (isRecording) {
      trailDispatch({
        type: TrailActions.AddLocation,
        payload: curLoc.coords,
      });
    }
  });

  const isUpdatingLocations = () =>
    Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  const doStartRecording = async () => {
    if (fgPermissions) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 1, // minimum change (in meters) betweens updates
        deferredUpdatesInterval: 1000, // minimum interval (in milliseconds) between updates

        foregroundService: {
          notificationTitle: "Using your location",
          notificationBody:
            "To turn off, go back to the app and click stop recording.",
        },
      });

      trailDispatch({ type: TrailActions.SetTrailId, payload: null });
      setIsRecording(true);
    } else {
      await checkFGStatus();
    }
  };

  const doStopRecording = async () => {
    if (await isUpdatingLocations()) {
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

      setIsRecording(false);
    }
  };

  const handleAddTrail = () => {
    setAddingTrail(true);
    doStartRecording();
  };

  const handleStopBtn = () => {
    setIsRecording(false);
  };

  const handleStartBtn = () => {
    setIsRecording(true);
  };

  const handleAddPOI = async () => {
    const curLoc = await currentLocation();

    setIsRecording(false);
    navigation.navigate("Point of Interest", {
      currentLocation: curLoc,
      trailId,
    });
  };

  const handleSave = () => {
    setIsRecording(false);
    setModalVisible(true);
  };

  const currentLocation = async () => {
    if (isAddingTrail) {
      return locationArr[locationArr.length - 1];
    } else {
      const curLoc = await Location.getCurrentPositionAsync();
      return curLoc.coords;
    }
  };

  const doCancel = async () => {
    await doStopRecording();
    setAddingTrail(false);
    setIsRecording(false);
    trailDispatch({ type: TrailActions.ClearLocations });
    trailDispatch({ type: TrailActions.ClearPOIArr });
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

      const response = await fetch(BASE_API + "trails", options);
      const data = (await response.json()) as any;

      if (data.error) {
        throw new Error(data.error);
      }

      const newTrail: TrailData = guardDataType<TrailData>(data);

      if (poiArr.length > 0) {
        const newTrailId = newTrail.trailId;

        for (let i = 0; i < poiArr.length; i++) {
          const point = poiArr[i];
          point.trailId = newTrailId;
          const newPOI = await addPOIToTrail(point, token);

          newTrail.PointsOfInterests?.push(newPOI);
        }
      }
      trailDispatch({ type: TrailActions.ClearPOIArr });
      trailDispatch({ type: TrailActions.ClearLocations });
      trailDispatch({ type: TrailActions.AddTrail, payload: newTrail });

      setAddingTrail(false);
      setIsRecording(false);
      await doStopRecording();
      setIsLoading(false);
      setError("");
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  useEffect(() => {
    if (!route.params?.status && !route.params?.errMsg) {
      return;
    }

    const { status, errMsg } = route.params;
    if (status) {
      setIsRecording(true);
    }
    if (errMsg) {
      setError(errMsg);
    }
  }, [route]);

  useEffect(() => {
    if (!gotTrailData) return;

    if (gotTrailData === "Closed") {
      setIsRecording(true);
    } else if (gotTrailData === "Cancel") {
      doCancel();
    } else {
      doSaveTrail(gotTrailData);
    }

    setGotTrailData(null);
  }, [gotTrailData]);

  if (!isAuthenticated) {
    return null;
  }
  return (
    <>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          width: "90%",
        }}
      >
        {isAddingTrail && <Text># of coordinates: {locationArr.length}</Text>}
        {isRecording && <Text>Recording</Text>}
      </View>
      <View style={[styles.btnContainer, { flexWrap: "wrap" }]}>
        {!isAddingTrail ? (
          <MapButton
            label="Add Trail"
            handlePress={handleAddTrail}
            backgroundColor="blue"
          />
        ) : (
          <>
            <StartButton
              isRecording={isRecording}
              locationArrLength={locationArr.length}
              handlePress={handleStartBtn}
            />
            <StopButton
              isRecording={isRecording}
              locationArrLength={locationArr.length}
              handlePress={handleStopBtn}
            />
            <SaveButton
              isRecording={isRecording}
              locationArrLength={locationArr.length}
              handlePress={handleSave}
            />
          </>
        )}
        <POIButton
          isAddingTrail={isAddingTrail}
          trailId={trailId}
          locationArrLength={locationArr.length}
          handlePress={handleAddPOI}
        />
      </View>
    </>
  );
}
