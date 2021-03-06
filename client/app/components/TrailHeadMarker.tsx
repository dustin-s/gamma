import { StyleSheet, Text, View } from "react-native";
import { Callout, Marker } from "react-native-maps";
import { TrailData } from "../interfaces/TrailData";
import { getColor } from "../utils/mapFunctions";

interface TrailHeadMarkerProps {
  trailInfo: TrailData;
}

export default function TrailHeadMarker({ trailInfo }: TrailHeadMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: trailInfo.TrailCoords[0].latitude,
        longitude: trailInfo.TrailCoords[0].longitude,
      }}
      pinColor={getColor(trailInfo.difficulty)}
    >
      <Callout tooltip>
        <View>
          <View style={styles.bubble}>
            <Text style={styles.header}>
              {trailInfo?.name ?? trailInfo.trailId}
            </Text>
            <Text>{trailInfo.description}</Text>
            <Text>Details:</Text>
            <Text>Distance: {trailInfo.distance}</Text>
            {trailInfo.PointsOfInterests &&
              trailInfo.PointsOfInterests.length > 0 && (
                <Text>Nature Trail</Text>
              )}
            <Text>{trailInfo.isClosed ? "Closed" : "Open"}</Text>
          </View>
          <View style={styles.arrowBorder} />
          <View style={styles.arrow} />
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bubble: {
    flexDirection: "column",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 0.5,
    padding: 15,
    width: 150,
  },
  arrow: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#fff",
    borderWidth: 16,
    alignSelf: "center",
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#007a87",
    borderWidth: 16,
    alignSelf: "center",
    marginTop: -0.5,
  },
});
