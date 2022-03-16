import { LocationObjectCoords } from "expo-location";
import { LatLng } from "react-native-maps";
import { TrailData } from "../interfaces/TrailData";

export const getCoords = (trailInfo: TrailData): LatLng[] =>
  trailInfo.TrailCoords.map((el: LocationObjectCoords) => ({
    longitude: el.longitude,
    latitude: el.latitude,
  }));

export const getColor = (difficulty?: string): string => {
  switch (difficulty) {
    case "hard":
      return "red";
    case "moderate":
      return "orange";
    case "easy":
      return "green";
    default:
      return "blue";
  }
};
