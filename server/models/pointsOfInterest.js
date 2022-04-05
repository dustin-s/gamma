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
      type: DataTypes.TEXT,
      comment: "This is a string that contains the link to the image.",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // location
    latitude: {
      type: DataTypes.DECIMAL(23, 18),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(23, 18),
      allowNull: false,
    },

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
    speed: {
      type: DataTypes.DECIMAL(23, 18),
    },
  },
  {
    sequelize,
    underscored: true,
  }
);

module.exports = PointsOfInterest;
