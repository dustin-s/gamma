import { POIObj } from "../../interfaces/POIObj";
import { ActionMap, TrailActions } from "./actions";
import { LocationActions } from "./locationReducer";
import { TrailListActions } from "./trailListReducer";
import { TrailIdActions } from "./trailIdReducer";

type poiPayload = {
  [TrailActions.ClearPOIArr]: undefined;
  [TrailActions.AddPOI]: POIObj;
};

export type POIActions = ActionMap<poiPayload>[keyof ActionMap<poiPayload>];

export const poiReducer = (
  state: POIObj[],
  action: POIActions | TrailIdActions | LocationActions | TrailListActions
) => {
  switch (action.type) {
    case TrailActions.ClearPOIArr:
      return (state = []);
    case TrailActions.AddPOI:
      return [...state, action.payload];
    default:
      return state;
  }
};
