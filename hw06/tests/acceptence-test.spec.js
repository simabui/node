const request = require('supertest');
const CS = require('../api/index');
var should = require('should');
const userModel = require('../api/users/users.model');

const INVALID_TOKEN = 'xxx';
const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMjAzMTU5MzkzMmI2MjFmYTE2MzljZCIsImlhdCI6MTU5NjI4Mjg2NCwiZXhwIjoxNTk4MDEwODY0fQ.ngYRpSHZK3e01tvmMWaT8mU-5pUCOl2Vd2nlcAefVXY';

// HTTP test
describe('endpoints test', () => {
  let app;

  before(async () => {
    const userServer = new CS();
    app = await userServer.start();
  });

  after(() => {
    app.close();
  });

  describe('GET /users/сurrent', () => {
    it('should return 401', async () => {
      await request(app)
        .get('/users/current')
        .auth(INVALID_TOKEN, { type: 'bearer' })
        .expect(401);
    });
  });

  context('When user successful registrate account', () => {
    after(async () => {
      await userModel.deleteMany();
    });

    it('should return 201', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          name: 'new user',
          email: 'test19@mail.com',
          password: 'some_password',
        })
        .expect(201);

      const responseBody = response.body;

      should.exists(responseBody);
      responseBody.should.have.property('email').which.is.a.String();
      responseBody.should.have.property('password').which.is.a.String();

      const createdUser = await userModel.findOne({
        email: responseBody.email,
      });

      createdUser.should.have.property('avatarURL').which.is.a.String();
      createdUser.should.have.property('verificationToken').which.is.a.String();
    });
  });
});
