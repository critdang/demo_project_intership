'use strict';
const bcrypt = require('bcryptjs');
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      user_email: 'admin@gmail.com',
      password: bcrypt.hashSync('123456',8),
      firstName: 'Huy',
      lastName: 'Dang',
      phoneNumber: '0945612156',
      age: '23',
      avatar: 'http://',
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
