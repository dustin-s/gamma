import { TrailCoords } from "../interfaces/TrailCoords";
import { TrailData } from "../interfaces/TrailData";

type PrintTrail = Omit<TrailData, "TrailCoords">;

const _printTrailWithoutCoords = (curTrail: TrailData): PrintTrail => {
  const { TrailCoords, ...printTrail } = curTrail;
  return printTrail;
};

export const printTrailWithoutCoords = (curTrail: TrailData | TrailData[]) => {
  let print: PrintTrail | PrintTrail[];

  if (Array.isArray(curTrail)) {
    const arrPrint: PrintTrail[] = curTrail.map((t) =>
      _printTrailWithoutCoords(t)
    );
    print = arrPrint;
  } else {
    print = _printTrailWithoutCoords(curTrail);
  }
  return print;
};
