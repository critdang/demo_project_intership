'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('User', [{
      user_email: 'example@example.com',
      password: '123456',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '0945246026',
      age: '23',
      avatar: 'http://',
      createdAt: new Date(),
      updatedAt: new Date()
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
