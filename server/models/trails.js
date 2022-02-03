const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Trail extends Model {}

Trail.init(
  {
    trailId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // createdAt, editedAt are default to sequelize
  },
  {
    sequelize,
    underscored: true,
    modelName: "trail",
  }
);

module.exports = Trail;
