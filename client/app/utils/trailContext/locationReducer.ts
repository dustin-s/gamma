import { LocationObjectCoords } from "expo-location";
import { ActionMap, Actions } from "./actions";

type locationPayload = {
  [Actions.SetAllLocations]: LocationObjectCoords[];
  [Actions.AddLocation]: LocationObjectCoords;
};

export type LocationActions =
  ActionMap<locationPayload>[keyof ActionMap<locationPayload>];

export const locationReducer = (
  state: LocationObjectCoords[],
  action: LocationActions
) => {
  switch (action.type) {
    case Actions.SetAllLocations:
      return (state = action.payload);
    case Actions.AddLocation:
      return [...state, action.payload];
    default:
      return state;
  }
};
