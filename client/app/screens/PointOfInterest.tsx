import { useContext, useEffect, useState } from "react";
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
import { POIObj } from "../interfaces/POIObj";

// Types:
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import { AuthContext } from "../contexts/authContext";
import { BASE_URL } from "../utils/constants";

type POIScreenProps = StackNativeScreenProps<"Point of Interest">;

export default function PointOfInterest({ navigation, route }: POIScreenProps) {
  const curLoc = route.params?.currentLocation ?? {
    latitude: 0,
    longitude: 0,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  };
  const poiObj: POIObj = route.params?.poi ?? {
    trailId: route.params?.trailId ? route.params.trailId : null,
    pointsOfInterestId: null,
    description: null,
    image: null,
    isActive: true,
    ...curLoc,
  };

  // add the base URL to the image - don't change/use the poiObj.image after this.
  const originalImage = poiObj.image ? BASE_URL + poiObj.image : null;

  const { auth } = useContext(AuthContext);
  const [image, setImage] = useState(originalImage); // stores the URI for the image
  const [editDesc, setEditDesc] = useState(poiObj.description === null);
  const [description, setDescription] = useState(poiObj.description);
  const [isActive, setIsActive] = useState(true);
  const [isDirty, setIsDirty] = useState({
    photoChanged: originalImage === null,
    descChanged: poiObj.description === null,
    isActiveChanged: false,
  });

  const handleCancelImage = () => {
    setImage(originalImage);
  };

  const handleCancelDesc = () => {
    setDescription(poiObj.description);
    setEditDesc(poiObj.description === null);
  };

  // Check Dirty
  const checkIsDirty = () => {
    return (
      isDirty.photoChanged || isDirty.descChanged || isDirty.isActiveChanged
    );
  };

  const handleSave = () => {
    console.log("********** handleSave **********");

    if (!auth.isAuthenticated || !checkIsDirty()) {
      console.log(`navigation.navigate("Trail Screen")`);
      navigation.navigate("Trail Screen");
      return;
    }

    console.log("Else...");
    // save...
    const errMsg: string[] = [];
    const newPOI: POIObj = { ...poiObj };

    // update the object and error check that required fields exist
    if (image) {
      if (isDirty.photoChanged) {
        newPOI.image = image;
      }
    } else {
      errMsg.push("An image is required");
    }
    if (description) {
      if (isDirty.descChanged) {
        newPOI.description = description;
      }
    } else {
      errMsg.push("Please add a description");
    }
    newPOI.isActive = isActive;

    if (errMsg.length > 0) {
      Alert.alert(errMsg.join("\n"));
    } else {
      navigation.navigate({
        name: "Trail Screen",
        params: { newPOI },
        merge: true,
      });
    }
  };

  useEffect(() => {
    const newIsDirty = {
      photoChanged: originalImage !== image || image === null,
      descChanged: poiObj.description !== description,
      isActiveChanged: poiObj.isActive !== isActive,
    };

    setIsDirty(newIsDirty);
  }, [image, description, isActive]);

  return (
    <View style={[styles.container]}>
      {/* do the editDesc here so it is at the top of the page... It will be easier for the user to enter data. If they want to see the image, they will just need to close the keyboard. */}
      {editDesc && (
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
        {auth.isAuthenticated && (
          <View style={styles.imageButtonContainer}>
            {isDirty.photoChanged && image && (
              <MapButton
                label="Cancel Photo"
                backgroundColor="blue"
                handlePress={handleCancelImage}
              />
            )}

            <ShowCamera
              label={
                image
                  ? isDirty.photoChanged
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
          {auth.isAuthenticated && (
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

      {auth.isAuthenticated && (
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

      {!checkIsDirty() ? (
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
    right: 135,
    padding: 5,
  },
  label: {
    fontSize: 20,
    marginRight: 5,
  },
});
