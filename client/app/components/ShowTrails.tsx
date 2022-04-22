import { SetStateAction } from "react";
import { LocationObjectCoords } from "expo-location";
import { TrailData } from "../interfaces/TrailData";

import { Marker, Polyline } from "react-native-maps";
import { getColor, getCoords } from "../utils/mapFunctions";
import { View } from "react-native";
import TrailHeadMarker from "./TrailHeadMarker";
import FlowerMarker from "./FlowerMarker";
import ConeMarker from "./ConeMarker";

interface ShowTrailsProps {
  data: TrailData[];
  locationArr: LocationObjectCoords[];
  trailId: number | null;
  setTrailId(value: SetStateAction<number | null>): void;
}

export default function ShowTrails({
  data,
  locationArr,
  trailId,
  setTrailId,
}: ShowTrailsProps) {
  const getDescription = (trailInfo: TrailData) => {
    const lines = [];

    lines.push(`trailId: ${trailInfo.trailId}`);
    if (trailInfo.name) lines.push(`name: ${trailInfo.name}`);
    if (trailInfo.description)
      lines.push(`Description\n${trailInfo.description}`);
    lines.push(`difficulty: ${trailInfo.difficulty}`);
    lines.push(`distance: ${+trailInfo.distance}`);
    lines.push(`closed: ${trailInfo.isClosed ? "yes" : "no"}`);

    return lines.join("\n");
  };

  // https://github.com/react-native-maps/react-native-maps/blob/master/docs/polyline.md
  const renderTrails = () => {
    // console.log("showTrails:");
    // console.log(
    //   "\ttrailID === null && locationArr.length:",
    //   trailID === null && locationArr.length
    // );
    // console.log(`\ttrailID && data: ${trailID && Boolean(data)}`);
    // console.log(`\tdata: ${Boolean(data)}`);
    // if (data?.length === undefined) {
    //   console.log(data);
    // } else console.log(`\tdata.length: ${data.length}`);
    if (trailId === null && locationArr.length > 0) {
      return (
        <Polyline
          coordinates={locationArr}
          strokeColor={getColor()}
          strokeWidth={6}
        />
      );
    } else if (trailId && data) {
      const trailInfo = data.filter(
        (el: TrailData) => el.trailId === trailId
      )[0];

      return (
        <Polyline
          coordinates={getCoords(trailInfo)}
          strokeColor={getColor(trailInfo.difficulty)}
          strokeWidth={6}
        />
      );
    } else if (data) {
      return data.map((trailInfo) => (
        <View key={trailInfo.trailId}>
          <Polyline
            coordinates={getCoords(trailInfo)}
            strokeColor={getColor(trailInfo.difficulty)}
            strokeWidth={6}
            tappable={true}
            onPress={() => setTrailId(trailInfo.trailId)}
          />
          <Marker
            coordinate={{
              latitude: +trailInfo.TrailCoords[0].latitude,
              longitude: +trailInfo.TrailCoords[0].longitude,
            }}
            pinColor={getColor(trailInfo.difficulty)}
          >
            <TrailHeadMarker trailInfo={trailInfo} />
          </Marker>
          {trailInfo.PointsOfInterests &&
            trailInfo.PointsOfInterests.length > 0 && (
              <FlowerMarker
                coords={{
                  latitude:
                    (+trailInfo.TrailCoords[0].latitude +
                      +trailInfo.TrailCoords[1].latitude) /
                    2,
                  longitude:
                    (+trailInfo.TrailCoords[0].longitude +
                      +trailInfo.TrailCoords[1].longitude) /
                    2,
                }}
              />
            )}
          {trailInfo.isClosed && (
            <ConeMarker
              coords={{
                latitude: +trailInfo.TrailCoords[1].latitude,
                longitude: +trailInfo.TrailCoords[1].longitude,
              }}
            />
          )}
        </View>
      ));
    }
  };

  return <>{renderTrails()}</>;
}
