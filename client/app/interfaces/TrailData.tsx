import { LocationObjectCoords } from "expo-location";
import { POIObj } from "./POIObj";

export interface TrailData {
  trailId: number | null;
  name?: string;
  description?: string;
  difficulty: "easy" | "moderate" | "hard";
  isClosed: boolean;
  createdBy: number;
  updatedBy?: number;
  distance: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  TrailCoords: LocationObjectCoords[];
  PointsOfInterests?: POIObj[];
  // hazards: HazardObj[];
}
