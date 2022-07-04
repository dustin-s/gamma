import { POIObj } from "../../interfaces/POIObj";
import { ActionMap, Actions } from "./actions";

type poiPayload = {
  [Actions.AddPOI]: POIObj;
};

export type POIActions = ActionMap<poiPayload>[keyof ActionMap<poiPayload>];

export const poiReducer = (state: POIObj[], action: POIActions) => {
  switch (action.type) {
    case Actions.AddPOI:
      return [...state, action.payload];
    default:
      return state;
  }
};
