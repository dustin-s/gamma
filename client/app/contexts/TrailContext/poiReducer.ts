import { POIObj } from "../../interfaces/POIObj";
import { ActionMap, TrailActions } from "./actions";

type poiPayload = {
  [TrailActions.ClearPOIArr]: undefined;
  [TrailActions.AddPOI]: POIObj;
};

export type POIActions = ActionMap<poiPayload>[keyof ActionMap<poiPayload>];

export const poiReducer = (state: POIObj[], action: POIActions) => {
  switch (action.type) {
    case TrailActions.ClearPOIArr:
      return (state = []);
    case TrailActions.AddPOI:
      return [...state, action.payload];
    default:
      throw Error(`Unknown action type: ${action}`);
  }
};
