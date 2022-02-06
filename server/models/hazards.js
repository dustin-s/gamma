const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

/**
 * This will store any hazards along the trail.
 */
class Hazards extends Model {}

Hazards.init(
  {
    hazardId: {
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
    // createdAt is the time it was found
    // editedAt is the time it was removed

    // location
    accuracy: {
      type: DataTypes.DECIMAL(5, 18),
    },
    altitude: {
      type: DataTypes.DECIMAL(5, 18),
    },
    altitudeAccuracy: {
      type: DataTypes.DECIMAL(5, 18),
    },
    heading: {
      type: DataTypes.DECIMAL(5, 18),
    },
    latitude: {
      type: DataTypes.DECIMAL(5, 18),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(5, 18),
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
  }
);

module.exports = Hazards;
