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
  hasNatureGuide: boolean;
  hasHazard: boolean;
  TrailCoords: LocationObjectCoords[];
  POI?: POIObj[];
  // hazards: HazardObj[];
}
