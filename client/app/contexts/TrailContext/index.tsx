// based off of https://medium.com/swlh/react-context-with-usereducer-and-typescript-1b7bd9a1c15

// how this works:
// each state item will have its type declared in the
// initialStateType and its default state in initialState
// each state item will then get its own reducer (in a
// separate file). The actions for the reducers will be
// declared in the actions.ts file. These will then be
// pulled in to the mainReducer function.
// Note: if all of the states are not declared in the
// mainReducer function, it will cause errors in the
// Provider -> useReducer function.
// NetNinja (https://www.youtube.com/watch?v=NKsVV7wJcDM&ab_channel=TheNetNinja)
// recommends doing a kooks file (useTrailContext) to do
// the functions in, this might be a good idea just to
// separate the logic out.

import { createContext, Dispatch, FC, useReducer } from "react";

import { TrailData } from "../../interfaces/TrailData";
import { LocationObjectCoords } from "expo-location";
import { POIObj } from "../../interfaces/POIObj";

import { locationReducer } from "./locationReducer";
import { poiReducer } from "./poiReducer";
import { trailDataReducer } from "./trailListReducer";
import { trailIdReducer } from "./trailIdReducer";

type initialStateType = {
  trailId: number | null;
  trailList: TrailData[];
  locationArr: LocationObjectCoords[];
  poiArr: POIObj[];
};

const initialState = {
  trailId: null,
  trailList: [],
  locationArr: [],
  poiArr: [],
};

const TrailContext = createContext<{
  trailState: initialStateType;
  trailDispatch: Dispatch<any>;
}>({ trailState: initialState, trailDispatch: () => null });

const mainReducer = (
  { trailId, trailList, locationArr, poiArr }: initialStateType,
  action: any
) => ({
  trailId: trailIdReducer(trailId, action),
  trailList: trailDataReducer(trailList, action),
  locationArr: locationReducer(locationArr, action),
  poiArr: poiReducer(poiArr, action),
});

const TrailContextProvider: FC = ({ children }) => {
  const [trailState, trailDispatch] = useReducer(mainReducer, initialState);

  return (
    <TrailContext.Provider value={{ trailState, trailDispatch }}>
      {children}
    </TrailContext.Provider>
  );
};

export { TrailContext, TrailContextProvider, initialStateType };
