const request = require('supertest');
const app = require('../../server');
const { Client } = require('../../models');
const { mockUser } = require('./mockObject');

exports.getLoginToken = async () => {
  await Client.create(mockUser);
  const res = await request(app)
    .post('/client/create')
    .send(mockUser);
  return {
    token: res.body.token,
    client_id: res.body,
  };
};