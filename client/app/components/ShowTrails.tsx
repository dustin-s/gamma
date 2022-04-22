import { SetStateAction } from "react";
import { LocationObjectCoords } from "expo-location";
import { TrailData } from "../interfaces/TrailData";

import { Polyline } from "react-native-maps";
import { getColor, getCoords } from "../utils/mapFunctions";

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
  // const showTrails = () => {
  // https://github.com/react-native-maps/react-native-maps/blob/master/docs/polyline.md

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
  const renderTrails = () => {
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
        <Polyline
          key={trailInfo.trailId}
          coordinates={getCoords(trailInfo)}
          strokeColor={getColor(trailInfo.difficulty)}
          strokeWidth={6}
          tappable={true}
          onPress={() => setTrailId(trailInfo.trailId)}
        />
      ));
    }
  };

  return <>{renderTrails()}</>;
}
