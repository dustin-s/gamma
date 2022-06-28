import { LocationObjectCoords } from "expo-location";

export interface POIObj extends LocationObjectCoords {
  trailID: number | null | undefined;
  pointsOfInterestId: number | null | undefined;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
