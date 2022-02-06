const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class TrailPoints extends Model {}

TrailPoints.init(
  {
    accuracy: {
      type: DataTypes.DECIMAL(23, 18),
    },
    altitude: {
      type: DataTypes.DECIMAL(23, 18),
    },
    altitudeAccuracy: {
      type: DataTypes.DECIMAL(23, 18),
    },
    heading: {
      type: DataTypes.DECIMAL(23, 18),
    },
    latitude: {
      type: DataTypes.DECIMAL(23, 18),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(23, 18),
      allowNull: false,
    },
    speed: {
      type: DataTypes.DECIMAL(23, 18),
    },
    timestamp: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    underscored: true,
  }
);

module.exports = TrailPoints;
