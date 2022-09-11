import { LocationObjectCoords } from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import MapButton from "../components/MapButton";
import ShowCamera from "../components/ShowCamera";
import { useAuthentication } from "../hooks/useAuthentication";
import { POIObj } from "../interfaces/POIObj";

// Types:
import { StackNativeScreenProps } from "../interfaces/StackParamList";
// import { AuthContext } from "../contexts/authContext";
import { BASE_URL } from "../utils/constants";

type POIScreenProps = StackNativeScreenProps<"Point of Interest">;

/**
 *
 * @param param0 - This parameter should a StackNativeScreenProps and contain a navigation and route
 * @returns React Native view for Point of Interest Screen
 */
export default function PointOfInterest({ navigation, route }: POIScreenProps) {
  const { isAuthenticated } = useAuthentication();

  const [origPOI, setOrigPOI] = useState<POIObj | null>(null);
  const [curLoc, setCurLoc] = useState<LocationObjectCoords | null>(null);
  const [trailId, setTrailId] = useState<number | null>(null);

  const [image, setImage] = useState<string | null>(null); // stores the URI for the image
  const [editDesc, setEditDesc] = useState(true);
  const [description, setDescription] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [isDirty, setIsDirty] = useState(false);

  const getOriginalImage = (origPoi: POIObj | null) =>
    origPoi ? BASE_URL + origPoi.image : null;

  const handleCancelImage = () => {
    const setTo = origPOI ? getOriginalImage(origPOI) : null;
    setImage(setTo);
  };

  const handleCancelDesc = () => {
    setDescription(origPOI?.description || null);
    setEditDesc(true);
  };
  const isPhotoDirty = () =>
    origPOI ? image !== getOriginalImage(origPOI) : image !== null;

  // Check Dirty
  const checkIsDirty = () => {
    const img = isPhotoDirty();
    const desc = description !== origPOI?.description;
    const active = isActive !== origPOI?.isActive;

    return { img, desc, active };
  };

  const saveErrorMessages = () => {
    const errMsg: string[] = [];
    if (!image) {
      errMsg.push("An image is required");
    }
    if (!description) {
      errMsg.push("Please add a description");
    }
    if (errMsg.length > 0) {
      return Alert.alert(errMsg.join("\n"));
    }
    return errMsg.length;
  };

  const handleSave = () => {
    if (!isAuthenticated || !isDirty) {
      navigation.navigate("Trail Screen");
      return;
    }

    // save...
    if (saveErrorMessages() !== 0) {
      return;
    }
    const img = checkIsDirty().img ? image : origPOI?.image;

    let newPOI: POIObj;
    if (origPOI) {
      newPOI = {
        ...origPOI,
        description: description,
        image: img!,
        isActive: isActive,
      };
    } else {
      if (!curLoc) {
        throw Error("No current location for newPOI being added");
      }
      newPOI = {
        trailId: trailId,
        pointsOfInterestId: null,
        description: description,
        image: image,
        isActive: isActive,
        ...curLoc,
      };
    }

    // savePOI(newPOI);
    navigation.navigate({
      name: "Trail Screen",
      params: { newPOI },
      merge: true,
    });
  };

  /*
  async function savePOI(newPOI: POIObj) {
    try {
      const token = getToken();
      const curTrailId = newPOI.trailId;
      const curPOIId = newPOI.pointsOfInterestId;

      // if new trail...
      if (!curPOIId && !curTrailId) {
        trailDispatch({ type: TrailActions.AddPOI, payload: newPOI });
        return;
      }

      // not a new trail - set up variable to store new list of POIs
      let newTrailsPOIs: POIObj[] = [];

      // get trailIndex
      const trailIndex = trailList.findIndex(
        (trail: TrailData) => trail.trailId === curTrailId
      );
      if (trailIndex < 0) {
        throw Error("SavePOI: No trail index found");
      }
      // get current list of POIs (this will be modified into newTrailsPOIs)
      const trailsPOIs = trailList[trailIndex].PointsOfInterests || [];

      // update existing POI ELSE new POI for existing Trail
      if (curPOIId && curTrailId) {
        const oldPOI = trailsPOIs.filter(
          (poi: POIObj) => poi.pointsOfInterestId === curPOIId
        )[0];

        const addedPOI = await updatePOI(newPOI, oldPOI, token);

        newTrailsPOIs = trailsPOIs.map((old: POIObj) =>
          old.pointsOfInterestId == addedPOI.pointsOfInterestId ? addedPOI : old
        );
      } else if (!curPOIId && curTrailId) {
        const addedPOI = await addPOIToTrail(newPOI, token);

        newTrailsPOIs = [...trailsPOIs, addedPOI];
      }
      // ensure update was done
      if (newTrailsPOIs.length > 0) {
        const newTrail = {
          ...trailList[trailIndex],
          PointsOfInterests: newTrailsPOIs,
        };
        trailDispatch({ type: TrailActions.UpdateTrail, payload: newTrail });
      }
      return;
      //
    } catch (err: any) {
      console.log(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }

    // resume recording (if needed)
    if (addingTrail) {
      setPauseRecording(false);
    }
  }
*/
  useEffect(() => {
    const { img, desc, active } = checkIsDirty();

    setIsDirty(img || desc || active);
  }, [image, description, isActive]);

  useEffect(() => {
    if (route.params.currentLocation) {
      setCurLoc(route.params.currentLocation);
    }
    if (route.params.trailId) {
      setTrailId(route.params.trailId);
    }
    if (route.params.poi) {
      let origPOI = { ...route.params.poi };
      setOrigPOI(origPOI);
      setImage(getOriginalImage(origPOI));
      setEditDesc(false);
      setDescription(origPOI.description);
      setIsActive(origPOI.isActive);
    }
  }, [route]);

  //
  useEffect(() => {
    console.log(
      "test values:",
      JSON.stringify(
        {
          isAuthenticated,
          origPOIObj: origPOI,
          isDirty,
          editDesc,
          checkIsDirty: checkIsDirty(),
          curLoc,
        },
        null,
        2
      )
    );
  });

  //

  return (
    <View style={[styles.textContainer]}>
      {/* do the editDesc here so it is at the top of the page... It will be easier for the user to enter data. If they want to see the image, they will just need to close the keyboard. */}
      {isAuthenticated && editDesc && (
        <View style={[styles.textContainer]}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a description"
            value={description ? description : undefined}
            onChangeText={(value) => setDescription(value)}
            multiline
            autoCapitalize="sentences"
          />
          <View style={styles.buttonContainer}>
            <MapButton
              label="Cancel"
              backgroundColor="red"
              handlePress={handleCancelDesc}
            />
            <MapButton
              label="Commit"
              backgroundColor="green"
              handlePress={() => setEditDesc(false)}
            />
          </View>
        </View>
      )}

      <ImageBackground
        source={{ uri: image ? image : "https://" }}
        style={styles.image}
      >
        {isAuthenticated && (
          <View style={styles.imageButtonContainer}>
            {checkIsDirty().img && image && (
              <MapButton
                label="Cancel Photo"
                backgroundColor="blue"
                handlePress={handleCancelImage}
              />
            )}

            <ShowCamera
              label={
                image
                  ? checkIsDirty().img
                    ? "Retake Photo"
                    : "Update Photo"
                  : "Add Photo"
              }
              setTakenImagePath={setImage}
            />
          </View>
        )}
      </ImageBackground>

      {!editDesc && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{description}</Text>
          {isAuthenticated && (
            <View style={styles.button}>
              <MapButton
                label="Edit"
                backgroundColor="blue"
                handlePress={() => setEditDesc(true)}
              />
            </View>
          )}
        </View>
      )}

      {isAuthenticated && (
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Active?</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isActive ? "#5fd455" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setIsActive(!isActive)}
            value={isActive}
          />
        </View>
      )}

      {!isDirty ? (
        <View style={styles.buttonContainer}>
          <MapButton
            label="Close"
            backgroundColor="blue"
            handlePress={handleSave}
          />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <MapButton
            label="Cancel"
            backgroundColor="red"
            handlePress={() => {
              navigation.navigate({
                name: "Trail Screen",
                params: { newPOI: "Cancel" },
                merge: true,
              });
            }}
          />
          <MapButton
            label="Save and Close"
            backgroundColor="red"
            handlePress={handleSave}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
  },
  button: {
    position: "absolute",
    right: 10,
    bottom: 5,
  },

  image: {
    height: 300,
    width: 400, //height*1.3333,
    resizeMode: "center",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  imageButtonContainer: {
    margin: 5,
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  textContainer: {
    paddingTop: 10,
    flexGrow: 1,
    width: 400,
  },
  text: {
    paddingHorizontal: 15,
    color: "black",
    // fontSize: 20,
    overflow: "scroll",
  },
  textInput: {
    borderWidth: 1,
    flexGrow: 1, // fill the available space
    textAlignVertical: "top",
    padding: 5,
    margin: 10,
  },
  buttonContainer: {
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  controlGroup: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  label: {
    fontSize: 20,
    marginRight: 5,
  },
});
