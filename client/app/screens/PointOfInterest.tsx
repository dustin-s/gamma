// this is based on https://www.freecodecamp.org/news/how-to-create-a-camera-app-with-expo-and-react-native/
// https://www.youtube.com/watch?v=RmlekGDv8RU&ab_channel=AaronSaunders
// https://docs.expo.dev/versions/latest/sdk/camera/

import { useContext, useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import CameraView from "../components/CameraView";
import MapButton from "../components/MapButton";
import { POIObj } from "../interfaces/POIObj";

// Types:
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import { AuthContext } from "../utils/authContext";
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
    trailId: null,
    pointsOfInterestId: null,
    description: null,
    image: null,
    isActive: true,
    ...curLoc,
  };

  const originalImage = poiObj.image ? BASE_URL + poiObj.image : null;

  const { auth } = useContext(AuthContext);
  const [showCamera, setShowCamera] = useState(false);
  const [editImage, setEditImage] = useState(poiObj.image === null);
  const [image, setImage] = useState(originalImage); // stores the URI for the image
  const [editDesc, setEditDesc] = useState(poiObj.description === null);
  const [description, setDescription] = useState(poiObj.description);
  const [isActive, setIsActive] = useState(true);
  const [isDirty, setIsDirty] = useState({
    photoChanged: poiObj.description === null,
    descChanged: poiObj.description === null,
    isActiveChanged: false,
  });

  const handleUpdateImage = (image: string) => {
    setImage(image);
    setEditImage(originalImage !== image);
    setIsDirty({ ...isDirty, photoChanged: originalImage !== image });
    setShowCamera(false);
  };

  const handleCancelImage = () => {
    console.log(poiObj);
    setImage(originalImage);
    setEditImage(false);
    setIsDirty({ ...isDirty, photoChanged: false });
  };

  const handleUpdateDesc = () => {
    setEditDesc(false);
    setIsDirty({ ...isDirty, descChanged: poiObj.description !== description });
  };

  const handleCancelDesc = () => {
    setDescription(poiObj.description);
    setEditDesc(false);
    setIsDirty({ ...isDirty, descChanged: false });
  };

  const handleSetIsActive = () => {
    setIsActive(!isActive);
    setIsDirty({ ...isDirty, isActiveChanged: !isDirty.isActiveChanged });
  };

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
      // console.log(
      //   `navigation.navigate({name: "Trail Screen", params: { newPOI }, merge: true, });`
      // );
      navigation.navigate({
        name: "Trail Screen",
        params: { newPOI },
        merge: true,
      });
    }
  };

  return (
    <View style={[styles.textContainer]}>
      {showCamera ? (
        <>
          <CameraView handleImage={handleUpdateImage} />
        </>
      ) : (
        <>
          {/* do the editDesc here so it is at the top of the page... It will be easier for the user to enter data. If they want to see the image, they will just need to close the keyboard. */}
          {editDesc && !editImage && (
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
                  handlePress={handleUpdateDesc}
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
                {editImage && image && (
                  <MapButton
                    label="Cancel Photo"
                    backgroundColor="blue"
                    handlePress={handleCancelImage}
                  />
                )}

                <MapButton
                  label={
                    image
                      ? editImage
                        ? "Retake Photo"
                        : "Update Photo"
                      : "Add Photo"
                  }
                  backgroundColor="blue"
                  handlePress={() => setShowCamera(true)}
                />
              </View>
            )}
          </ImageBackground>

          {(!editDesc || (editDesc && editImage)) && (
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
                onValueChange={handleSetIsActive}
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
                  navigation.goBack();
                }}
              />
              <MapButton
                label="Save and Close"
                backgroundColor="red"
                handlePress={handleSave}
              />
            </View>
          )}
        </>
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
