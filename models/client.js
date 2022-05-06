'use strict';
const bcrypt = require('bcryptjs');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Class, {
        through: 'Regis',
        foreignKey: 'client_id',
        otherKey: 'class_id',
      });
    }
  }
  Client.init({
    client_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    client_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: 'Email is required' },
        notEmpty: { msg: 'Email must not be empty' },
        isEmail: { msg: 'Your email not valid , please use another one' },
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
      allowNull: false,
      validate: {
        notNull: { msg: 'first name must be filled' },
        notEmpty: { msg: 'first name must not be empty' },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull: false,
      // validate: {
      //     notNull: { msg: 'last name must be filled' },
      //     notEmpty: { msg: 'last name must not be empty' },
      // },
    },
    countLogin: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: 'Client',
    hooks: {
      beforeCreate: async (client, options) => {
        client.password =
          client.password && client.password !== ''
            ? await bcrypt.hash(client.password, 8)
            : '';
      },
    }
  });
  return Client;
};