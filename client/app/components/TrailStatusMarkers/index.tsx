// arrow functionality of the custom marker came from: https://www.youtube.com/watch?v=4N-8RTeQ1fA&ab_channel=PradipDebnath

import { Image, StyleSheet, Text, View } from "react-native";
import { LatLng, Marker } from "react-native-maps";
import { TrailData } from "../../interfaces/TrailData";
import { distance, findPoint } from "../../utils/distance";
import { getCoords } from "../../utils/mapFunctions";

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
  // find the halfway point of the trail for the placement of the marker
  // step through each point of the trail and find its distance from the origin (adding along the way). Once the current point is beyond the 1/2 way mark, then find the distance between return where, between those 2 points the halfway mark is.
  const getPlacement = (): LatLng => {
    const trailPts = getCoords(trailInfo);
    const endDist = trailInfo.distance / 2;
    const maxTrailPt = Math.ceil(trailPts.length / 2);
    let curDist = 0;
    let prevDist = 0;
    let curPt = 0;
    let prevPt = 0;

    while (curPt <= maxTrailPt) {
      prevPt = curPt;
      curPt++;

      prevDist = curDist;
      curDist += distance(trailPts[prevPt], trailPts[curPt]);

      if (curDist > endDist) {
        const remainingDist = endDist - prevDist;

        return findPoint(trailPts[prevPt], trailPts[curPt], remainingDist);
      }
    }

    return {
      latitude: trailInfo.TrailCoords[1].latitude,
      longitude: trailInfo.TrailCoords[1].longitude,
    };
  };

  return (
    <Marker coordinate={getPlacement()}>
      <View>
        {/* add appropriate images on top of the distance bubble -- this will keep the bubble centered on the marker's location */}
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
        {/* show the distance bubble */}
        <View style={styles.bubble}>
          <Text style={styles.label}>{trailInfo.distance.toFixed(2)}</Text>
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
