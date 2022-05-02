// this is based on https://www.freecodecamp.org/news/how-to-create-a-camera-app-with-expo-and-react-native/
// https://www.youtube.com/watch?v=RmlekGDv8RU&ab_channel=AaronSaunders
// https://docs.expo.dev/versions/latest/sdk/camera/

import { useContext, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
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
  // stores the URI for the image
  const [image, setImage] = useState(getImage(poiObj?.image));
  const [editDesc, setEditDesc] = useState(poiObj.description === null);
  const [description, setDescription] = useState(poiObj?.description);
  const [isActive, setIsActive] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const handleEditDesc = () => {
    setEditDesc(true);
  };

  const handleCancelDesc = () => {
    setDescription(poiObj?.description);
    setEditDesc(false);
    checkIsDirty();
  };

  const handleUpdateDesc = () => {
    setEditDesc(false);
    checkIsDirty();
  };

  const takePhoto = () => {
    // do something
  };

  const handleSetIsActive = () => {
    setIsActive(!isActive);
    checkIsDirty();
  };

  const checkIsDirty = () => {
    const photoChanged = getImage(poiObj.image) !== image;
    const descChanged = poiObj.description !== description;
    const isActiveChanged = poiObj.isActive !== isActive;

    setIsDirty(photoChanged || descChanged || isActiveChanged);
  };

  const handleSave = () => {
    if (!auth.isAuthenticated || !isDirty) {
      navigation.navigate("Trail Screen");
    }

    // save...
  };

  return (
    <View style={styles.container}>
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
                handlePress={takePhoto}
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
              handlePress={takePhoto}
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
                handlePress={handleEditDesc}
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
