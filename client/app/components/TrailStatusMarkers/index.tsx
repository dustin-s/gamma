import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LatLng, Marker } from "react-native-maps";
import { TrailData } from "../../interfaces/TrailData";

const isNatureTrail = (trailInfo: TrailData) => {
  const activePOI = [];
  if (trailInfo.PointsOfInterests) {
    trailInfo.PointsOfInterests.map((poi) => {
      if (poi.isActive) {
        activePOI.push(poi);
      }
    });
  }
  return activePOI.length > 0;
};

interface TrailStatusMarkersProps {
  trailInfo: TrailData;
}

export default function TrailStatusMarkers({
  trailInfo,
}: TrailStatusMarkersProps) {
  const getPlacement = (): LatLng => {
    // console.log("middle of the trail lat/lng coords", trailInfo.trailId);
    return {
      latitude: +trailInfo.TrailCoords[1].latitude,
      longitude: +trailInfo.TrailCoords[1].longitude,
    };
  };

  return (
    <Marker coordinate={getPlacement()}>
      <View>
        <View style={styles.container}>
          {trailInfo.isClosed && (
            <Image
              source={require("./cone.png")}
              style={styles.image}
              resizeMethod={"resize"}
            />
          )}
          {isNatureTrail(trailInfo) && (
            <Image
              source={require("./flower.png")}
              style={styles.image}
              resizeMethod={"resize"}
            />
          )}
        </View>
        <View style={styles.bubble}>
          <Text style={styles.label}>
            {Number(trailInfo.distance).toFixed(2)}
          </Text>
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
