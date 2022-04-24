// based on https://stackoverflow.com/questions/6981916/how-to-calculate-distance-between-two-locations-using-their-longitude-and-latitu

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
exports.distance = (coord1: Coord, coord2: Coord) => {
  const theta = coord1.lon - coord2.lon;
  // find the distance on a circle
  let dist =
    Math.sin(deg2rad(coord1.lat)) * Math.sin(deg2rad(coord2.lat)) +
    Math.cos(deg2rad(coord1.lat)) *
      Math.cos(deg2rad(coord2.lat)) *
      Math.cos(deg2rad(theta));
  dist = Math.acos(dist);
  dist = rad2deg(dist);

  // 60 nautical miles to one degree, a nautical mile is 1.1515 statute miles
  dist = dist * 60 * 1.1515;

  return dist;
};

// convert degrees to radians
function deg2rad(deg: number) {
  return deg * (Math.PI / 180.0);
}

// convert radians to degrees
function rad2deg(rad: number) {
  return rad * (180.0 / Math.PI);
}
