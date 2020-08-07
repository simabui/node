const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const usersModel = require('../api/users/users.model');
const authControl = require('../api/auth/auth.controller');

describe('User tests', () => {
  let sandbox;
  let findByIdStub;
  let next = {};
  const JWT_KEY = process.env.JWT_SECRETKEY;

  let req = {
    body: {},
    headers: {
      authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMjAzMTU5MzkzMmI2MjFmYTE2MzljZCIsImlhdCI6MTU5NjI4Mjg2NCwiZXhwIjoxNTk4MDEwODY0fQ.ngYRpSHZK3e01tvmMWaT8mU-5pUCOl2Vd2nlcAefVXY',
    },
  };
  res = {
    status: () => {
      return {
        send: () => 'Not Authorize',
      };
    },
  };

  before(async () => {
    sandbox = sinon.createSandbox();
    sandbox.spy(jwt, 'verify');
    findByIdStub = sandbox.stub(usersModel, 'findById');

    await authControl.authorize(req, res, next);
  });

  after(() => {
    sandbox.restore();
  });

  describe('#authorize', () => {
    it('should call verify', () => {
      sinon.assert.calledOnce(jwt.verify);
    });

    it('should call findById', () => {
      sinon.assert.calledOnce(findByIdStub);
    });

    it('should pass with valid token', () => {
      const token = req.headers.authorization.split(' ')[1];
      sinon.assert.calledOnceWithExactly(jwt.verify, token, JWT_KEY);
    });

    it('should never pass without token', () => {
      sinon.assert.neverCalledWith(jwt.verify, '', JWT_KEY);
    });

    it('should never pass with non-valid token', () => {
      sinon.assert.neverCalledWith(jwt.verify, 'test', JWT_KEY);
    });
  });
});
