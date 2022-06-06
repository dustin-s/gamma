import { LocationObjectCoords } from "expo-location";

export interface TrailCoords extends LocationObjectCoords {
  trailId: number;
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
