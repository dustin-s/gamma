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
import { useTrailContext } from "../hooks/useTrailContext";
import { POIObj } from "../interfaces/POIObj";

// Types:
import {
  StackNativeScreenProps,
  SaveTrailStates,
} from "../interfaces/StackParamList";
// import { AuthContext } from "../contexts/authContext";
import { BASE_URL } from "../utils/constants";
import { addPOIToTrail, updatePOI } from "../utils/fetchHelpers";

type POIScreenProps = StackNativeScreenProps<"Point of Interest">;

/**
 *
 * @param param0 - This parameter should a StackNativeScreenProps and contain a navigation and route
 * @returns React Native view for Point of Interest Screen
 */
export default function PointOfInterest({ navigation, route }: POIScreenProps) {
  const { isAuthenticated, getToken } = useAuthentication();
  const { trailDispatch, TrailActions } = useTrailContext();

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

  const handleCancel = () =>
    navigation.navigate({
      name: "Trail Screen",
      params: { status: "cancel" },
      merge: true,
    });

  const handleSave = async () => {
    if (!isAuthenticated || !isDirty) {
      navigation.navigate("Trail Screen");
      return;
    } else if (saveErrorMessages() !== 0) {
      return;
    } else {
      const { status, errMsg } = await saveTrail();
      navigation.navigate({
        name: "Trail Screen",
        params: { status, errMsg },
        merge: true,
      });
    }
  };

  async function saveTrail(): Promise<{
    status?: SaveTrailStates;
    errMsg?: string | undefined;
  }> {
    let status: SaveTrailStates = "unsaved";

    try {
      const token = getToken();

      if (origPOI) {
        // remove URL from original image value
        const img = checkIsDirty().img ? image : origPOI?.image;
        const updatedPOIObj: POIObj = {
          ...origPOI,
          description: description,
          image: img,
          isActive: isActive,
        };

        const updatedPOI = await updatePOI(updatedPOIObj, origPOI, token);
        console.log({ updatedPOI });

        trailDispatch({
          type: TrailActions.UpdateTrailsPOI,
          payload: updatedPOI,
        });
        return { status: "saved" };
      }

      if (!curLoc) {
        throw Error("No current location for newPOI being added");
      }

      const newPOI: POIObj = {
        trailId: trailId,
        pointsOfInterestId: null,
        description: description,
        image: image,
        isActive: isActive,
        ...curLoc,
      };

      if (trailId) {
        const addedPOI = await addPOIToTrail(newPOI, token);

        trailDispatch({
          type: TrailActions.UpdateTrailsPOI,
          payload: addedPOI,
        });
      } else {
        trailDispatch({ type: TrailActions.AddPOI, payload: newPOI });
      }

      return { status: "added" };
    } catch (err) {
      let errMsg: string = "Add POI: ";
      if (err instanceof Error) {
        errMsg += err.message;
      } else {
        errMsg += String(err);
      }
      return { status, errMsg };
    }
  }

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
  // test prints
  /*
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
  */
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
            handlePress={handleCancel}
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
