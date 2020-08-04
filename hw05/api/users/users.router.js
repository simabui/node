const express = require('express');
const path = require('path');
const multer = require('multer');
const UsersControl = require('./Users.controller');
const usersRouter = express.Router();

const storage = multer.diskStorage({
  destination: './tmp',
  filename: function (req, file, cb) {
    const { fieldname, originalname } = file;
    const { user } = req;
    cb(null, fieldname + '-' + user.email + path.extname(originalname));
  },
});
const upload = multer({ storage });

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
usersRouter.get('/users/test', UsersControl.authorize);
usersRouter.patch('/users', UsersControl.authorize, UsersControl.updateUser);
usersRouter.patch(
  '/users/avatars',
  UsersControl.authorize,
  upload.single('avatar'),
  UsersControl.updateUserAvatar,
);
module.exports = usersRouter;
