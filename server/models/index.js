// this will export the models and their relationships
const User = require("./users");
const Trail = require("./trails");
const TrailCoords = require("./trailCoords");
const PointsOfInterest = require("./pointsOfInterest");
const Hazards = require("./hazards");
// const PointsOfInterest=
User.hasMany(Trail);
Trail.belongsTo(User);

Trail.hasMany(TrailCoords);
TrailCoords.belongsTo(Trail);

Trail.hasMany(PointsOfInterest);
PointsOfInterest.belongsTo(Trail);

Trail.hasMany(Hazards);
Hazards.belongsTo(Trail);

module.exports = {
  User,
  Trail,
  TrailCoords,
  PointsOfInterest,
  Hazards,
};
