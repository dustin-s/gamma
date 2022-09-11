import { SetStateAction, useContext, useEffect } from "react";
import { LocationObjectCoords } from "expo-location";
import { TrailData } from "../interfaces/TrailData";

import { Polyline } from "react-native-maps";
import { View } from "react-native";
import TrailHeadMarker from "./TrailHeadMarker";
import TrailStatusMarkers from "./TrailStatusMarkers";
import { getColor, getCoords } from "../utils/mapFunctions";
import POIMarker from "./POIMarker";
import { useTrailContext } from "../hooks/useTrailContext";
import { AuthContext } from "../contexts/authContext";

interface ShowTrailsProps {
  locationArr: LocationObjectCoords[];
  trailId: number | null;
  setTrailId(value: SetStateAction<number | null>): void;
}

export default function ShowTrails({
  locationArr,
  trailId,
  setTrailId,
}: ShowTrailsProps) {
  const { auth } = useContext(AuthContext);
  const { trailList } = useTrailContext();

  const renderTrails = () => {
    if (trailId === null && locationArr.length > 0) {
      return (
        <Polyline
          coordinates={locationArr}
          strokeColor={getColor()}
          strokeWidth={6}
        />
      );
    } else if (trailId && trailList) {
      const trailInfo = trailList.filter(
        (el: TrailData) => el.trailId === trailId
      )[0];
      const poiList =
        trailInfo.PointsOfInterests?.filter((poi) =>
          auth.isAuthenticated ? poi : poi.isActive
        ) || null;

      return (
        <View>
          <Polyline
            coordinates={getCoords(trailInfo)}
            strokeColor={getColor(trailInfo.difficulty)}
            strokeWidth={6}
          />
          {poiList &&
            poiList.map((poi) => (
              <POIMarker poi={poi} key={poi.pointsOfInterestId} />
            ))}
        </View>
      );
    } else if (trailList) {
      return trailList.map((trailInfo) => {
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
