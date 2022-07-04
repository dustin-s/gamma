import { TrailData } from "../../interfaces/TrailData";
import { ActionMap, Actions } from "./actions";

type trailDataPayload = {
  [Actions.SetAllTrails]: TrailData[];
  [Actions.AddTrail]: TrailData;
};

export type TrailDataActions =
  ActionMap<trailDataPayload>[keyof ActionMap<trailDataPayload>];

export const trailDataReducer = (
  state: TrailData[],
  action: TrailDataActions
) => {
  switch (action.type) {
    case Actions.SetAllTrails:
      return (state = action.payload);
    case Actions.AddTrail:
      return [...state, action.payload];
    default:
      return state;
  }
};
