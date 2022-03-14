export interface POIObj {
  trailID: number | null | undefined;
  description: string | null;
  image: string | null;
  isActive: boolean;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  latitude: number;
  longitude: number;
  speed?: number;
}
