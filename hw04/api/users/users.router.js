const express = require('express');
const UsersControl = require('./Users.controller');
const usersRouter = express.Router();

usersRouter.post(
  '/auth/register',
  UsersControl.validateAddUser,
  UsersControl.registerUser,
);

usersRouter.post(
  '/auth/login',
  UsersControl.validateLoginUser,
  UsersControl.loginUser,
);

usersRouter.post(
  '/auth/logout',
  UsersControl.authorize,
  UsersControl.logoutUser,
);
usersRouter.get(
  '/users/current',
  UsersControl.authorize,
  UsersControl.getCurrentUser,
);
usersRouter.patch('/users', UsersControl.authorize, UsersControl.updateUser);
module.exports = usersRouter;
