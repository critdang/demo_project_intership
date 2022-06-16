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

describe('Get Endpoints', () => {
  it('get All Class', async () => {
    const res = await request(app)
      .get('/classes')
      .send({
      })
    expect(res.statusCode).toEqual(200)
  })
})

describe('Post Endpoints', () => {
  it('Create class', async () => {
    const res = await request(app)
      .post('/classes/create')
      .send({
        subject: 'test1',
        max_students: 10,
        from: '2022-05-26',
        to: '2022-06-29'
      })
    expect(res.statusCode).toEqual(200)
  })
})

describe('Post Endpoints', () => {
  it('Update class', async () => {
    const res = await request(app)
      .post('/classes/')
      .send({
        subject: 'test1',
        max_students: 10,
        from: '2022-05-26',
        to: '2022-06-29'
      })
    expect(res.statusCode).toEqual(200)
  })
})

