import { LocationObjectCoords } from "expo-location";

export interface TrailData {
  trailId: number | null;
  name?: string;
  description?: string;
  difficulty: "easy" | "moderate" | "hard";
  createdBy: number;
  updatedBy?: number;
  isClosed: boolean;
  distance: number;
  hasNatureGuid: boolean;
  hasHazard: boolean;
  TrailCoords: LocationObjectCoords[];
}
