const express = require('express');
const authRouter = express.Router();
const AuthControl = require('./auth.controller');
const UsersControl = require('../users/users.controller');

authRouter.post(
  '/register',
  AuthControl.validateAddUser,
  AuthControl.registerUser,
);

authRouter.post('/login', AuthControl.validateLoginUser, AuthControl.loginUser);
authRouter.post('/logout', AuthControl.authorize, AuthControl.logoutUser);
authRouter.get('/verify/:verificationToken', AuthControl.verify);

module.exports = authRouter;
