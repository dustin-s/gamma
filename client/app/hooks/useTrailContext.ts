import { useContext } from "react";
import { initialStateType, TrailContext } from "../contexts/TrailContext";

// this is mainly being used to spread the TrailContext
export const useTrailContext = () => {
  const context = useContext(TrailContext);

  // This isn't really needed since the navigator doesn't let us put this on individual screens
  if (!context) {
    throw Error(
      "You must be within the TrailContextProvider to use TrailContext."
    );
  }

  // destructure the context so we can use the values directly, TS doesn't let us just spread the state.
  const { trailId, trailList, locationArr, poiArr }: initialStateType =
    context.trailState;

  return {
    trailId,
    trailList,
    locationArr,
    poiArr,
    trailDispatch: context.trailDispatch,
  };
};
