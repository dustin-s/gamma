import { createContext, Dispatch, FC, useReducer } from "react";

import { TrailData } from "../../interfaces/TrailData";
import { LocationObjectCoords } from "expo-location";
import { POIObj } from "../../interfaces/POIObj";

import { locationReducer } from "./locationReducer";
import { poiReducer } from "./poiReducer";
import { trailDataReducer } from "./trailDataReducer";
import { trailIdReducer } from "./trailIdReducer";

type defaultStateType = {
  trailId: number | null;
  trailData: TrailData[];
  locationArr: LocationObjectCoords[];
  poiArr: POIObj[];
};

const defaultState = {
  trailId: null,
  trailData: [],
  locationArr: [],
  poiArr: [],
};

const TrailContext = createContext<{
  state: defaultStateType;
  dispatch: Dispatch<any>;
}>({ state: defaultState, dispatch: () => null });

const mainReducer = (
  { trailId, trailData, locationArr, poiArr }: defaultStateType,
  action: any
) => ({
  trailId: trailIdReducer(trailId, action),
  trailData: trailDataReducer(trailData, action),
  locationArr: locationReducer(locationArr, action),
  poiArr: poiReducer(poiArr, action),
});

const TrailContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, defaultState);

  return (
    <TrailContext.Provider value={{ state, dispatch }}>
      {children}
    </TrailContext.Provider>
  );
};

export { TrailContext, TrailContextProvider };
