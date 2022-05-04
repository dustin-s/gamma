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

const getImage = (str: string | null) => {
  if (str) {
    return BASE_URL + str;
  }
  return null;
};

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

  const { auth } = useContext(AuthContext);
  const [showCamera, setShowCamera] = useState(false);
  // stores the URI for the image
  const [image, setImage] = useState(getImage(poiObj.image));
  const [editDesc, setEditDesc] = useState(poiObj.description === null);
  const [description, setDescription] = useState(poiObj.description);
  const [isActive, setIsActive] = useState(true);
  const [isDirty, setIsDirty] = useState({
    photoChanged: poiObj.description === null,
    descChanged: poiObj.description === null,
    isActiveChanged: false,
  });

  const takePhoto = () => {
    // do something
  };

  const handleCancelDesc = () => {
    setDescription(poiObj.description);
    setEditDesc(false);
    setIsDirty({ ...isDirty, descChanged: false });
  };

  const handleUpdateDesc = () => {
    setEditDesc(false);
    setIsDirty({ ...isDirty, descChanged: poiObj.description !== description });
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
    // console.log("!auth.isAuthenticated", !auth.isAuthenticated);
    // console.log("!checkIsDirty()", !checkIsDirty());
    // console.log(
    //   `!auth.isAuthenticated || !checkIsDirty(): ${
    //     !auth.isAuthenticated || !checkIsDirty()
    //   }`
    // );

    if (!auth.isAuthenticated || !checkIsDirty()) {
      console.log(`navigation.navigate("Trail Screen")`);
      navigation.navigate("Trail Screen");
      return;
    }

    console.log("Else...");
    // save...
    const errMsg: string[] = [];
    const newPOI: POIObj = { ...poiObj };
    image ? (newPOI.image = image) : errMsg.push("An image is required");
    description
      ? (newPOI.description = description)
      : errMsg.push("Please add a description");
    newPOI.isActive = isActive;

    if (errMsg.length > 0) {
      Alert.alert(errMsg.join("\n"));
    } else {
      console.log(
        `navigation.navigate({name: "Trail Screen", params: { newPOI }, merge: true, });`
      );
      navigation.navigate({
        name: "Trail Screen",
        params: { newPOI },
        merge: true,
      });
    }
  };

  return (
    <View style={[styles.textContainer]}>
      {console.log("showCamera:", showCamera)}
      {showCamera ? (
        <>
          <CameraView />
        </>
      ) : (
        <>
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
                  handlePress={handleUpdateDesc}
                />
              </View>
            </View>
          )}

          {image ? (
            <ImageBackground
              source={{ uri: image }}
              style={styles.image}
              // resizeMethod="scale"
            >
              {auth.isAuthenticated && (
                <View style={styles.button}>
                  <MapButton
                    label="Update Photo"
                    backgroundColor="blue"
                    handlePress={() => setShowCamera(true)}
                  />
                </View>
              )}
            </ImageBackground>
          ) : (
            <View style={styles.imageContainer}>
              <View style={styles.button}>
                <MapButton
                  label="Add Photo"
                  backgroundColor="blue"
                  handlePress={() => setShowCamera(true)}
                />
              </View>
            </View>
          )}

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
                onValueChange={handleSetIsActive}
                value={isActive}
              />
            </View>
          )}

          {console.log("isDirty:", isDirty)}
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

  // when no image
  imageContainer: {
    height: 300,
    width: 400,
  },
  image: {
    height: 300,
    width: 400, //height*1.3333,
    resizeMode: "contain",
    alignSelf: "flex-start",
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
