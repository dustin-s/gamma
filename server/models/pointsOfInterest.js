const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

/**
 * This model will contain data points that have images and text to along the trail. This is optional for the trail.
 */
class PointsOfInterest extends Model {}

PointsOfInterest.init(
  {
    pointsOfInterestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.BLOB,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // location
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
  },
  {
    sequelize,
    underscored: true,
  }
);

module.exports = PointsOfInterest;
