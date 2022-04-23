export interface POIObj {
  trailID: number | null | undefined;
  pointsOfInterestId: number | null | undefined;
  description: string | null;
  image: string | null;
  isActive: boolean;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  createdAt: Date;
  updatedAt: Date;
}
