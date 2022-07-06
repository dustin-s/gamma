import { LocationObjectCoords } from "expo-location";
import { ActionMap, TrailActions } from "./actions";

type locationPayload = {
  [TrailActions.ClearLocations]: undefined;
  [TrailActions.AddLocation]: LocationObjectCoords;
};

export type LocationActions =
  ActionMap<locationPayload>[keyof ActionMap<locationPayload>];

export const locationReducer = (
  state: LocationObjectCoords[],
  action: LocationActions
) => {
  switch (action.type) {
    case TrailActions.ClearLocations:
      // console.log("Clear Locations");
      return (state = []);
    case TrailActions.AddLocation:
      // console.log("Add Locations");
      return [...state, action.payload];
    default:
      throw Error(`Unknown action type: ${action}`);
  }
};
