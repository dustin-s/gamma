import { ActionMap, Actions } from "./actions";

type TrailIdPayload = {
  [Actions.SetTrailId]: number | null;
};

export type TrailIdActions =
  ActionMap<TrailIdPayload>[keyof ActionMap<TrailIdPayload>];

export const trailIdReducer = (
  state: number | null,
  action: TrailIdActions
) => {
  switch (action.type) {
    case Actions.SetTrailId:
      return (state = action.payload);
    default:
      return state;
  }
};
