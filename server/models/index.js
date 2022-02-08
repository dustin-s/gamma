// this will export the models and their relationships
const User = require("./users");
const Trail = require("./trails");
const TrailCoords = require("./trailCoords");
const PointsOfInterest = require("./pointsOfInterest");
const Hazards = require("./hazards");

Trail.TrailCoords = Trail.hasMany(TrailCoords);
TrailCoords.belongsTo(Trail, { foreignKey: { allowNull: false } });

Trail.hasMany(PointsOfInterest);
PointsOfInterest.belongsTo(Trail, { foreignKey: { allowNull: false } });

Trail.hasMany(Hazards);
Hazards.belongsTo(Trail, { foreignKey: { allowNull: false } });

module.exports = {
  User,
  Trail,
  TrailCoords,
  PointsOfInterest,
  Hazards,
};
