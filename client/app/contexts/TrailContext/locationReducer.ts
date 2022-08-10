import { LocationObjectCoords } from "expo-location";
import { ActionMap, TrailActions } from "./actions";
import { POIActions } from "./poiReducer";
import { TrailListActions } from "./trailListReducer";
import { TrailIdActions } from "./trailIdReducer";

type locationPayload = {
  [TrailActions.ClearLocations]: undefined;
  [TrailActions.AddLocation]: LocationObjectCoords;
};

export type LocationActions =
  ActionMap<locationPayload>[keyof ActionMap<locationPayload>];

export const locationReducer = (
  state: LocationObjectCoords[],
  action: LocationActions | TrailIdActions | TrailListActions | POIActions
) => {
  switch (action.type) {
    case TrailActions.ClearLocations:
      // console.log("Clear Locations");
      return (state = []);
    case TrailActions.AddLocation:
      // console.log("Add Locations");
      return [...state, action.payload];
    default:
      return state;
  }
};
