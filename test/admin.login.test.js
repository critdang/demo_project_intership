const request = require('supertest')
const app = require('../server')
describe('Post Endpoints', () => {
  it('Login', async () => {
    const res = await request(app)
      .post('/admin/login')
      .send({
        user_email: 'admin@gmail.com',
        password: '123456'
      })
    expect(res.statusCode).toEqual(200)
  })
})

describe('Get All Class', () => {
  it('get All Class', async () => {
    const res = await request(app)
      .get('/admin/allClass')
      .send({
      })
      console.log(res)
    expect(res.statusCode).toEqual(200)
  })
})

describe('Create class', () => {
  it('Create class', async () => {
    const res = await request(app)
      .post('/admin/createClass')
      .send({
        subject: 'test1',
        max_students: 10,
        from: '2022-05-26',
        to: '2022-06-29'
      })
      console.log(res)
    expect(res.statusCode).toEqual(200)
  })
})