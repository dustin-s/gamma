// arrow functionality of the custom marker came from: https://www.youtube.com/watch?v=4N-8RTeQ1fA&ab_channel=PradipDebnath

import { Image, StyleSheet, Text, View } from "react-native";
import { LatLng, Marker } from "react-native-maps";
import { POIObj } from "../interfaces/POIObj";

interface POIMarkerProps {
  poi: POIObj;
}

export default function POIMarker({ poi }: POIMarkerProps) {
  return (
    <Marker coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}>
      <View>
        <View style={styles.bubble}>
          <Text style={styles.label}>{poi.image}</Text>
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
