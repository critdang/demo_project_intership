'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Classes', {
      class_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      subject: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      class_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      to: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('open', 'close', 'pending'),
        defaultValue: 'pending',
        allowNull: true,
      },
      week_day: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      max_students: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      current_student: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Classes');
  }
};