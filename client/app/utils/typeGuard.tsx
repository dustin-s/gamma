import { TrailData } from "../interfaces/TrailData";

export const trailDataTypeGuard = (data: any): TrailData[] => {
  const td = {};

  data.forEach((trail: any) => {
    console.log(trail.trailId);
    console.log(Object.keys(trail));
  });

  // return td as TrailData;
  return data as TrailData[];
};
