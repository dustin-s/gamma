// arrow functionality of the custom marker came from: https://www.youtube.com/watch?v=4N-8RTeQ1fA&ab_channel=PradipDebnath

import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { LatLng, Marker } from "react-native-maps";
import { POIObj } from "../interfaces/POIObj";
import { BASE_API } from "../utils/constants";

interface POIMarkerProps {
  poi: POIObj;
}

const handleOnPress = () => {
  console.log("navigate to POI screen");
};

export default function POIMarker({ poi }: POIMarkerProps) {
  return (
    <Marker
      coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
      onPress={handleOnPress}
    >
      <View>
        <View style={styles.bubble}>
          <ImageBackground
            source={{ uri: BASE_API + poi.image?.slice(2 - poi.image.length) }}
            style={styles.image}
          />
        </View>
        <View style={styles.arrowBorder} />
        <View style={styles.arrow} />
      </View>
    </Marker>
  );
}

const TEXT_COLOR = "brown";
const styles = StyleSheet.create({
  // Stores the images
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    paddingBottom: 5,
  },
  image: {
    height: 19,
    width: 19,
    resizeMode: "contain",
  },

  // the bubble around the distance label
  bubble: {
    flex: 1,
    flexDirection: "column",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 26,
    borderColor: TEXT_COLOR,
    borderWidth: 1,
    padding: 5,
  },
  arrow: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#fff",
    borderWidth: 8,
    alignSelf: "center",
    marginTop: -18,
  },
  arrowBorder: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: TEXT_COLOR, //"#007a87",
    borderWidth: 8,
    alignSelf: "center",
    marginTop: -0.5,
  },

  label: {
    color: TEXT_COLOR,
    fontStyle: "italic",
  },
});
