// based on https://stackoverflow.com/questions/6981916/how-to-calculate-distance-between-two-locations-using-their-longitude-and-latitu

import { LatLng } from "react-native-maps";
interface Coord {
  lat: number;
  lon: number;
}

/**
 * Find the distance between 2 coordinate points in miles
 *
 * @param coord1
 * @param coord2
 * @returns
 */
export const distance = (coord1: LatLng, coord2: LatLng) => {
  const theta = coord1.longitude - coord2.longitude;
  // find the distance on a circle
  let dist =
    Math.sin(deg2rad(coord1.latitude)) * Math.sin(deg2rad(coord2.latitude)) +
    Math.cos(deg2rad(coord1.latitude)) *
      Math.cos(deg2rad(coord2.latitude)) *
      Math.cos(deg2rad(theta));
  dist = Math.acos(dist);
  dist = rad2deg(dist);

  // 60 nautical miles to one degree, a nautical mile is 1.1515 statute miles
  dist = dist * 60 * 1.1515;

  return dist;
};

export const findPoint = (coord1: LatLng, coord2: LatLng, dist: number) => {
  const x = coord2.latitude - coord1.latitude;
  const y = coord2.longitude - coord1.longitude;

  // t is the ration between the distances
  const fullDist = distance(coord1, coord2);
  const t = dist / fullDist;

  const newCoord: LatLng = {
    latitude: (1 - t) * coord1.latitude + t * coord2.latitude,
    longitude: (1 - t) * coord1.longitude + t * coord2.longitude,
  };

  return newCoord;
};

// convert degrees to radians
function deg2rad(deg: number) {
  return deg * (Math.PI / 180.0);
}

// convert radians to degrees
function rad2deg(rad: number) {
  return rad * (180.0 / Math.PI);
}
