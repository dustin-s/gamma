import { ActionMap, TrailActions } from "./actions";

type TrailIdPayload = {
  [TrailActions.SetTrailId]: number | null;
};

export type TrailIdActions =
  ActionMap<TrailIdPayload>[keyof ActionMap<TrailIdPayload>];

export const trailIdReducer = (
  state: number | null,
  action: TrailIdActions
) => {
  switch (action.type) {
    case TrailActions.SetTrailId:
      // console.log("Set Trail Id:", action.payload);
      return (state = action.payload);
    default:
      return state;
  }
};
