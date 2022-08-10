import { LocationObjectCoords } from "expo-location";

export interface POIObj extends LocationObjectCoords {
  trailId: number | null;
  pointsOfInterestId: number | null;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
