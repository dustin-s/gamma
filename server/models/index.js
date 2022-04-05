// this will export the models and their relationships
const User = require("./users");
const Trail = require("./trails");
const TrailCoords = require("./trailCoords");
const PointsOfInterest = require("./pointsOfInterest");
const Hazards = require("./hazards");

Trail.TrailCoords = Trail.hasMany(TrailCoords, {
  foreignKey: {
    name: "trailId",
    allowNull: false,
  },
});
TrailCoords.belongsTo(Trail, {
  foreignKey: {
    name: "trailId",
    allowNull: false,
  },
});

Trail.hasMany(PointsOfInterest, {
  foreignKey: {
    name: "trailId",
    allowNull: false,
  },
});
PointsOfInterest.belongsTo(Trail, {
  foreignKey: {
    name: "trailId",
    allowNull: false,
  },
});

Trail.hasMany(Hazards, {
  foreignKey: {
    name: "trailId",
    allowNull: false,
  },
});
Hazards.belongsTo(Trail, {
  foreignKey: {
    name: "trailId",
    allowNull: false,
  },
});

module.exports = {
  User,
  Trail,
  TrailCoords,
  PointsOfInterest,
  Hazards,
};
