import { POIObj } from "../../interfaces/POIObj";
import { TrailData } from "../../interfaces/TrailData";
import { printTrailWithoutCoords } from "../../utils/testingHelpers";
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
    case TrailActions.UpdateTrailsPOI:
      const curTrailId = action.payload.trailId;
      const curTrail = state.find((prev) => prev.trailId === curTrailId);

      if (!curTrail) {
        console.log("Unable to find trail when updating POI");
        return state;
      }

      return state.map((t) =>
        t.trailId === curTrailId ? updateTrailPOI(curTrail, action.payload) : t
      );

    default:
      return state;
  }
};

function updateTrailPOI(prevTrail: TrailData, poi: POIObj) {
  const { pointsOfInterestId: poiId } = poi;
  const curTrail: TrailData = { ...prevTrail };

  let newPOIs: POIObj[] = [];
  if (!curTrail.PointsOfInterests) {
    newPOIs.push(poi);
  } else if (
    !curTrail.PointsOfInterests.some((p) => p.pointsOfInterestId === poiId)
  ) {
    newPOIs = [...curTrail.PointsOfInterests, poi];
  } else {
    newPOIs = curTrail.PointsOfInterests!.map((p) =>
      p.pointsOfInterestId === poiId ? poi : p
    );
  }
  curTrail.PointsOfInterests = [...newPOIs];

  return curTrail;
}

function hasPoiId(curTrail: TrailData, poiId: number | null) {
  return (
    curTrail.PointsOfInterests &&
    curTrail.PointsOfInterests.some((p) => p.pointsOfInterestId === poiId)
  );
}
