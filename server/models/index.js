// this will export the models and their relationships
const User = require("./users");
const Trail = require("./trails");

User.hasMany(Trail);
Trail.belongsTo(User);

module.exports = {
  User,
  Trail,
};
