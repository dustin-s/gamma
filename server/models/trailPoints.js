const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class TrailPoints extends Model {}

TrailPoints.init(
  {
    accuracy: {
      type: DataTypes.INTEGER,
    },
    altitude: {
      type: DataTypes.INTEGER,
    },
    altitudeAccuracy: {
      type: DataTypes.INTEGER,
    },
    heading: {
      type: DataTypes.INTEGER,
    },
    latitude: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    speed: {
      type: DataTypes.INTEGER,
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
