import { TrailData } from "../../interfaces/TrailData";
import { ActionMap, TrailActions } from "./actions";

type trailDataPayload = {
  [TrailActions.SetAllTrails]: TrailData[];
  [TrailActions.AddTrail]: TrailData;
};

export type TrailDataActions =
  ActionMap<trailDataPayload>[keyof ActionMap<trailDataPayload>];

export const trailDataReducer = (
  state: TrailData[],
  action: TrailDataActions
) => {
  switch (action.type) {
    case TrailActions.SetAllTrails:
      return (state = action.payload);
    case TrailActions.AddTrail:
      return [...state, action.payload];
    default:
      throw Error(`Unknown action type: ${action}`);
  }
};
