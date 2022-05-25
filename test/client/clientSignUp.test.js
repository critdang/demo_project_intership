const request = require('supertest');
const app = require('../../server');
const { Client } = require('../../models');
const  helperFn  = require('../../utils/helperFn');
const signUpObj = {
    client_email: 'signup@gmail.com',
    password: '123456',
    firstName: 'signup',
}

describe('SIGN UP client/create', () => {

    afterAll(async () => {
        await Client.destroy({
          where: { client_email: 'signup@gmail.com' },
        });
    });

    it(' response status code 200 when create new User', async () => {
        const sendEmailMock = jest.spyOn(helperFn, 'sendEmail');
        const res = await request(app)
            .post('/client/create')
            .send(signUpObj);
        expect(res.statusCode).toBe(200);
        expect(sendEmailMock).toHaveBeenCalled();

    })

    it(' response status code 400 when the email have already taken', async () => {
        const res = await request(app)
            .post('/client/create')
            .send(signUpObj);
            expect(res.statusCode).toBe(400);
    })

    it(' return status code 400 if signup with invalid password', async () => {
        const res = await request(app)
        .post('/client/create')
        .send({ ...signUpObj, password: '123abc' });
        expect(res.statusCode).toBe(400);
    });

    it(' return status code 400 if create with missing email field', async () => {
        const res = await request(app)
          .post('/client/create')
          .send({ password: '123456' ,firstName: 'John'});
          console.log(res);
        expect(res.statusCode).toBe(400);
    });
})