const request = require('supertest');
const app = require('../../server');
const { Client } = require('../../models');
const { mockUser } = require('../helper/mockObject');

const clientSeed = {
    email: 'client@gmail.com',
    password: '123456',
  };
  
  describe('Authentication', () => {
    let token;
    beforeAll(async () => {
        await Client.create(mockUser);
    })
    afterAll(async () => {
        await Client.destroy({where: {client_email: mockUser.client_email}});
    })
    beforeEach(async () => {
        const res = await request(app).post('client/login').send(mockUser);
        token = res.body.token;
      });
    
    it('return invalid token', async () => {
        token = 'Invalid token';
        const res = await request(app)
            .get('/api/classes')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(401);
    })
    it('should return 401 if no token is provided', async () => {
        token = '';
        const res = await request(app)
          .get('/api/classes')
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(401);
    });
    it('should return 200 if token is valid', async () => {
      const res = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
    })
    
  })