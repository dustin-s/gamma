// this will export the models and their relationships
const User = require("./users");
const Trail = require("./trails");
const TrailPoints = require("./trailPoints");

User.hasMany(Trail);
Trail.belongsTo(User);

Trail.hasMany(TrailPoints);
TrailPoints.belongsTo(Trail);

module.exports = {
  User,
  Trail,
  TrailPoints,
};
