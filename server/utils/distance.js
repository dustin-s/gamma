// based on https://stackoverflow.com/questions/6981916/how-to-calculate-distance-between-two-locations-using-their-longitude-and-latitu
exports.distance = (lat1, lon1, lat2, lon2) => {
  const theta = lon1 - lon2;
  // find the distance on a circle
  let dist =
    Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.cos(deg2rad(theta));
  dist = Math.acos(dist);
  dist = rad2deg(dist);

  // 60 nautical miles to one degree, a nautical mile is 1.1515 statute miles
  dist = dist * 60 * 1.1515;

  // console.log("\nlat1 = ", lat1, "\nlon1 = ", lon1, "\nlat2 = ", lat2, "\nlon2 = ", lon2, "\ntheta = ", theta, "\ndist = ", dist);

  return dist;
};

// convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI / 180.0);
}

// convert radians to degrees
function rad2deg(rad) {
  return rad * (180.0 / Math.PI);
}
