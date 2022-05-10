'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class Regis extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Client, { foreignKey: 'client_id' });
      this.belongsTo(models.Class, { foreignKey: 'class_id' });
    }
  }
  Regis.init({
    reg_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Class',
        key: 'class_id',
      },
    },
    client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Client',
      key: 'client_id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'cancel', 'active'),
      defaultValue: 'pending',
      allowNull: false,
    },
    regisDate: {
      type: DataTypes.DATE,
      get() {
          return moment(this.getDataValue('regisDate')).format('YYYY-MM-DD');
        },
    },
    admAction: {
      type: DataTypes.ENUM('accept', 'reject'),
    },
  }, {
    sequelize,
    modelName: 'Regis',
  });
  return Regis;
};