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

  ClearLocations = "SET_ALL_LOCATION",
  AddLocation = "ADD_LOCATION",

  // editing POI or adding new to trail, will actually update TrailData[], not POI[]
  AddPOI = "ADD_POI",
  ClearPOIArr = "CLEAR_POI_ARR",
}
