const request = require('supertest');
const app = require('../../server');
const { Client } = require('../../models');
const helperFn = require('../../utils/helperFn');

const signUpObj = {
  client_email: 'abc@gmail.com',
  username: 'binladen',
  password: '123456',
};
describe('Verify User Email', () => {
  let verifyToken;
  beforeAll(async () => {
    await Client.create({
        client_email: 'abc@gmail.com',
        password: '123456',
        firstName: 'test',
        isActive: '1'
      });
    verifyToken = helperFn.generateToken({ client_email: signUpObj.client_email }, '3m');
  });

  afterAll(async () => {
    await Client.destroy({
      where: { client_email: signUpObj.client_email },
    });
  });

  it('should return 200 if user verify their email successfully', async () => {
    const res = await request(app).get(`/client/verify/${verifyToken}`);
    console.log(res)
    expect(res.statusCode).toBe(200);
  });

  it(' return error if email does not in Database', async () => {
    verifyToken = helperFn.generateToken({ client_email: 'random@gmail.com' }, '3m');
    const res = await request(app).get(`/client/verify/${verifyToken}`);
    expect(res.statusCode).toBe(401);
  });
  it('should return error if token expired', async () => {
    verifyToken = helperFn.generateToken({ client_email: signUpObj.client_email }, '0s');
    const res = await request(app).get(`/client/verify/${verifyToken}`);
    console.log('res expired',res)
    expect(res.statusCode).toBe(401);
  });
});