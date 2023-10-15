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
      allowNull: true,
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
    updatedBy: {
      type: DataTypes.INTEGER,
      comment: "This needs to be a valid user ID",
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    distance: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED.ZEROFILL,
      comment:
        "this should be calculated based on sum of the distance between the trailPoints",
    },
  },
  {
    sequelize,
    underscored: true,
  }
);

module.exports = Trail;
