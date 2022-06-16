const path = require('path');
const fsExtra = require('fs-extra');
const request = require('supertest');
const app = require('../../server');
const { Client } = require('../../models');
const { mockUser } = require('../helper/mockObject');
const helperTest = require('../helper/helperTest');

describe('UPDATE_PROFILE AND UPDATE_PASSWORD', () => {
    let token;
    beforeAll(async () => {
      const client = await helperTest.getLoginToken();
      token = client.token;
    });
    afterAll(async () => {
      await Client.destroy({ where: { client_email: mockUser.client_email } });
    });
    // UPDATE_PROFILE
    describe('update_profile', () => {
      afterAll(async () => {
        //delete all image when user upload inside 'test folder'
        const fileDir = path.join(__dirname, '../../public/image/test');
        await fsExtra.emptyDir(fileDir);
      });
  
      it('should return 200 if insert valid image file when update', async () => {
        const res = await request(app)
          .patch('/client/update_me')
          .set('Content-Type', 'multipart/form-data')
          .set('Authorization', `Bearer ${token}`)
        //   .attach('avatar',s 'test/img/client-avatar.jpeg');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
      });
    });
});