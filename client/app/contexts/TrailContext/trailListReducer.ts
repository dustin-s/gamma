import { POIObj } from "../../interfaces/POIObj";
import { TrailData } from "../../interfaces/TrailData";
import { ActionMap, TrailActions } from "./actions";
import { LocationActions } from "./locationReducer";
import { POIActions } from "./poiReducer";
import { TrailIdActions } from "./trailIdReducer";

type trailListPayload = {
  [TrailActions.SetAllTrails]: TrailData[];
  [TrailActions.AddTrail]: TrailData;
  [TrailActions.UpdateTrail]: TrailData;
  [TrailActions.UpdateTrailsPOI]: POIObj;
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
    case TrailActions.UpdateTrail:
      return state.map((prev: TrailData) =>
        prev.trailId === action.payload.trailId ? action.payload : prev
      );
    case TrailActions.UpdateTrailsPOI: {
      const { trailId, pointsOfInterestId } = action.payload;
      const curTrail = state.filter((trail) => (trail.trailId = trailId))[0];

      console.log({ action });
      if (trailId) {
        curTrail.PointsOfInterests?.map((old) =>
          old.pointsOfInterestId === pointsOfInterestId ? action.payload : old
        );
      } else if (curTrail.PointsOfInterests?.length) {
        curTrail.PointsOfInterests = [
          ...curTrail.PointsOfInterests,
          action.payload,
        ];
      } else {
        curTrail.PointsOfInterests = [action.payload];
      }

      return state.map((old) => (old.trailId === trailId ? curTrail : old));
    }
    default:
      return state;
  }
};
