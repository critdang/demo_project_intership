const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const { mockUser } = require('./mockObject');

exports.getLoginToken = async () => {
  await User.create(mockUser);
  const res = await request(app).post('/api/users/login').send(mockUser);
  return {
    token: res.body.token,
    userId: res.body.data.user.id,
  };
};