import { useContext } from "react";
import { initialStateType, TrailContext } from "../contexts/TrailContext";
import { TrailActions } from "../contexts/TrailContext/actions";

export const useTrailContext = () => {
  const context = useContext(TrailContext);

  // This isn't really needed since the navigator doesn't let us put this on individual screens
  if (!context) {
    throw Error(
      "You must be within the TrailContextProvider to use TrailContext."
    );
  }

  const { trailId, trailList, locationArr, poiArr }: initialStateType =
    context.trailState;

  return {
    trailId,
    trailList,
    locationArr,
    poiArr,
    trailDispatch: context.trailDispatch,
    TrailActions,
  };
};
