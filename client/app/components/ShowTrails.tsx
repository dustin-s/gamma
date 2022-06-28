import { SetStateAction } from "react";
import { LocationObjectCoords } from "expo-location";
import { TrailData } from "../interfaces/TrailData";

import { Polyline } from "react-native-maps";
import { View } from "react-native";
import TrailHeadMarker from "./TrailHeadMarker";
import TrailStatusMarkers from "./TrailStatusMarkers";
import { getColor, getCoords } from "../utils/mapFunctions";
import POIMarker from "./POIMarker";

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
        <View>
          <Polyline
            coordinates={getCoords(trailInfo)}
            strokeColor={getColor(trailInfo.difficulty)}
            strokeWidth={6}
          />
          {trailInfo.PointsOfInterests &&
            trailInfo.PointsOfInterests.map((poi) => (
              <POIMarker poi={poi} key={poi.pointsOfInterestId} />
            ))}
        </View>
      );
    } else if (data) {
      return data.map((trailInfo) => {
        const activePOI = [];
        if (trailInfo.PointsOfInterests) {
          trailInfo.PointsOfInterests.map((poi) => {
            if (poi.isActive) {
              activePOI.push(poi);
            }
          });
        }
        return (
          <View key={trailInfo.trailId}>
            <Polyline
              coordinates={getCoords(trailInfo)}
              strokeColor={getColor(trailInfo.difficulty)}
              strokeWidth={6}
              tappable={true}
              onPress={() => setTrailId(trailInfo.trailId)}
            />

            <TrailHeadMarker trailInfo={trailInfo} />
            <TrailStatusMarkers trailInfo={trailInfo} />
          </View>
        );
      });
    }
  };

  return <>{renderTrails()}</>;
}
