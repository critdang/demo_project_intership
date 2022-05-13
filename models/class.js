'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Client, {
        through: 'Regis',
        foreignKey: 'class_id',
        otherKey: 'client_id'
      })
    }
  }
  Class.init({
    class_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    subject: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notNull: { msg: 'subject is required' },
        notEmpty: { msg: 'subject must not be empty' },
      },
    },
    class_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    from: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue('startDate')).format('YYYY-MM-DD');
      },
    },
    to: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue('endDate')).format('YYYY-MM-DD');
      },
    },
    status: {
      type: DataTypes.ENUM('open', 'close', 'pending'),
      defaultValue: 'pending',
      allowNull: false,
    },
    week_day: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    max_students: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        notNull: { msg: 'maxStudent is required' },
      },
    },
    current_student: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Class',
  });
  return Class;
};