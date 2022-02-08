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
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["easy", "moderate", "hard"]],
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "This needs to be a valid user ID",
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // these fields should be calculated. Distance is calculated from the trailPoints, the second is if there are any values in the markerPoints. These are convenience fields to save calculations.
    distance: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED.ZEROFILL,
      comment:
        "this should be calculated based on sum of the distance between the trailPoints",
    },
    hasNatureGuide: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "this is true if pointsOfInterest has values",
    },
    hasHazard: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "this is true if hazards has values",
    },
    // createdAt, editedAt are default to sequelize
  },
  {
    sequelize,
    underscored: true,
  }
);

module.exports = Trail;
