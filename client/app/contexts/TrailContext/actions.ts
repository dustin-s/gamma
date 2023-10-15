export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum TrailActions {
  SetTrailId = "SET_TRAIL_ID",

  SetAllTrails = "SET_ALL_TRAILS",
  AddTrail = "ADD_TRAIL",
  UpdateTrail = "UPDATE_TRAIL",
  UpdateTrailsPOI = "UPDATE_TRAILS_POI",

  ClearLocations = "SET_ALL_LOCATION",
  AddLocation = "ADD_LOCATION",

  ClearPOIArr = "CLEAR_POI_ARR",
  AddPOI = "ADD_POI",
}
