'use strict';
const bcrypt = require('bcryptjs');
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    user_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'Email is required' },
        notEmpty: { msg: 'Email must not be empty' },
        // isEmail: { msg: 'Your email not valid , please use another one' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password is required' },
        notEmpty: { msg: 'Password must not be empty' },
        // isEmail: { msg: 'Your Password not valid , please use another one' },
      },
    },
    firstName: {
      type: DataTypes.STRING,
      // allowNull: false,
      // validate: {
      //   notNull: { msg: 'name must be filled' },
      //   notEmpty: { msg: 'name must not be empty' },
      // },
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull: true,
      // validate: {
      //   notNull: { msg: 'name must be filled' },
      //   notEmpty: { msg: 'name must not be empty' },
      // },
    },
    phonenumber: {
      type: DataTypes.STRING,
    },
    age: {
      type: DataTypes.INTEGER,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user, options) => {
        user.password =
          user.password && user.password !== ''
            ? await bcrypt.hash(user.password, 8): '';
      },
    }
  });
  return User;
};