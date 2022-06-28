const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class TrailCoords extends Model {}

// this will store the "coords" part of the location object
TrailCoords.init(
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
  },
  {
    sequelize,
    underscored: true,
  }
);

module.exports = TrailCoords;
