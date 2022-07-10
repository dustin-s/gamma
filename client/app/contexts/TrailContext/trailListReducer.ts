import { TrailData } from "../../interfaces/TrailData";
import { ActionMap, TrailActions } from "./actions";
import { LocationActions } from "./locationReducer";
import { POIActions } from "./poiReducer";
import { TrailIdActions } from "./trailIdReducer";

type trailListPayload = {
  [TrailActions.SetAllTrails]: TrailData[];
  [TrailActions.AddTrail]: TrailData;
};

export type TrailListActions =
  ActionMap<trailListPayload>[keyof ActionMap<trailListPayload>];

export const trailDataReducer = (
  state: TrailData[],
  action: TrailListActions | TrailIdActions | LocationActions | POIActions
) => {
  switch (action.type) {
    case TrailActions.SetAllTrails:
      return (state = action.payload);
    case TrailActions.AddTrail:
      return [...state, action.payload];
    default:
      return state;
  }
};