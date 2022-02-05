// this will export the models and their relationships
const User = require("./users");
const Trail = require("./trails");
const TrailPoints = require("./trailPoints");
const PointsOfInterest = require("./pointsOfInterest");
const Hazards = require("./hazards");
// const PointsOfInterest=
User.hasMany(Trail);
Trail.belongsTo(User);

Trail.hasMany(TrailPoints);
TrailPoints.belongsTo(Trail);

Trail.hasMany(PointsOfInterest);
PointsOfInterest.belongsTo(Trail);

Trail.hasMany(Hazards);
Hazards.belongsTo(Trail);

module.exports = {
  User,
  Trail,
  TrailPoints,
  PointsOfInterest,
  Hazards,
};
