import { TrailCoords } from "./TrailCoords";
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
  createdAt: Date;
  updatedAt: Date;
  TrailCoords: TrailCoords[];
  PointsOfInterests?: POIObj[];
}
