// this is based on https://www.freecodecamp.org/news/how-to-create-a-camera-app-with-expo-and-react-native/
// https://www.youtube.com/watch?v=RmlekGDv8RU&ab_channel=AaronSaunders
// https://docs.expo.dev/versions/latest/sdk/camera/

import { useContext } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapButton from "../components/MapButton";

// Types:
import { StackNativeScreenProps } from "../interfaces/StackParamList";
import { AuthContext } from "../utils/authContext";
import { BASE_URL } from "../utils/constants";

type POIScreenProps = StackNativeScreenProps<"Point of Interest">;

export default function PointOfInterest({ navigation, route }: POIScreenProps) {
  const { poi } = route.params;

  const { auth } = useContext(AuthContext);

  const editPOI = () => {
    console.log("Edit POI", poi.description);
    navigation.navigate("Home");
  };
  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: BASE_URL + poi.image }} style={styles.image} />
      <Text style={styles.text}>{poi.description}</Text>
      {auth.isAuthenticated && (
        <View style={styles.button}>
          <MapButton
            label="Edit"
            backgroundColor="blue"
            handlePress={editPOI}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    height: "100%",
  },
  image: {
    height: "50%",
    width: "100%",
    resizeMode: "center",
    alignSelf: "flex-start",
  },
  text: {
    paddingHorizontal: 10,
    color: "black",
    // fontSize: 20,
    overflow: "scroll",
  },
  button: {
    position: "absolute",
    right: 5,
    bottom: 5,
  },
});
