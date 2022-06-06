const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../config/connection.js");

class User extends Model {
  /**
   * Checks if a password is valid.
   *
   * @param {string} loginPwd password being tested
   * @returns {boolean} true if password matches
   */
  checkPassword(loginPwd) {
    return bcrypt.compareSync(loginPwd, this.password);
  }
}

User.init(
  {
    // Model attributes are defined here
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8],
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    requestPwdReset: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastPwdUpdate: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  },
  {
    hooks: {
      beforeCreate: async (newUserData) => {
        newUserData.password = await bcrypt.hash(newUserData.password, 10);

        // update lastPwdUpdate
        newUserData.lastPwdUpdate = new Date();

        return newUserData;
      },
      beforeUpdate: async (userData) => {
        // update password only if password changed
        if (
          userData.dataValues.password != userData._previousDataValues.password
        ) {
          // console.log(
          //   "\nHook: beforeUpdate: Password updated\nuserData(.dataValues):\n",
          //   userData.toJSON(),
          //   "\n\nNew password: ",
          //   userData.dataValues.password,
          //   "\nPrevious password: ",
          //   userData._previousDataValues.password,
          //   "\n"
          // );

          userData.password = await bcrypt.hash(userData.password, 10);

          // update lastPwdUpdate
          userData.lastPwdUpdate = new Date();

          // reset requestPwdReset
          userData.requestPwdReset = false;
        }
        return userData;
      },
    },

    sequelize,
    underscored: true,
  }
);

module.exports = User;
