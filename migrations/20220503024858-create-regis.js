'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Regises', {
      reg_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'cancel', 'active'),
        defaultValue: 'pending',
        allowNull: false,
      },
      regisDate: {
        type: Sequelize.DATE,
        get() {
        return moment(this.getDataValue('regisDate')).format('YYYY-MM-DD');
        },
      },
      admAction: {
        type: Sequelize.ENUM('accept', 'reject'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Regises');
  }
};