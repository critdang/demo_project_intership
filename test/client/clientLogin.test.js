const request = require('supertest');
const app = require('../../server');
const { Client } = require('../../models');
const { mockUser } = require('../helper/mockObject');

describe('Login /client/login', () => {
    beforeAll(async () => {
        await Client.create({
          client_email: 'user@gmail.com',
          password: '123456',
          firstName: 'test',
          isActive: '1'
        });
    });
    afterAll(async () => {
        await Client.destroy({where: {client_email:mockUser.client_email}});
    });
    it('get error message if no provided email',async () => {
        const res = await request(app)
            .post('/client/login')
            .send({password: 'test'})
        expect(res.statusCode).toEqual(400);
    })
    it('get error message if no provided password',async () => {
        const res = await request(app)
            .post('/client/login')
            .send({ email: 'test@gmail.com' })
        expect(res.statusCode).toEqual(400);
    })
    it('should get error message if password not correct', async () => {
        const res = await request(app)
          .post('/client/login')
          .send({ ...mockUser, password: 'wrongPassword' });
          expect(res.statusCode).toBe(400);
    });
    it('should block user if their password not correct 3 time', async () => {
        //request login 3 time with wrong password
        await request(app)
          .post('/client/login')
          .send({ ...mockUser, password: 'wrong' });
        await request(app)
          .post('/client/login')
          .send({ ...mockUser, password: 'wrong' });
        await request(app)
          .post('/client/login')
          .send({ ...mockUser, password: 'wrong' });
        // result
        const res = await request(app)
          .post('/client/login')
          .send({ ...mockUser, password: 'wrong' });
        // expect(res.body.message).toMatch(
        //   /your account has been disabled or not active yet/
        // );
        expect(res.statusCode).toBe(400);
      });
    
      it(' get error message if email not correct', async () => {
        const res = await request(app)
          .post('/client/login')
          .send({ email: 'EmailNotExist@gmail.com', password: '123456' });
        expect(res.statusCode).toBe(400);
      });
})