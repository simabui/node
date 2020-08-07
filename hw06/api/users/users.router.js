const express = require('express');
const path = require('path');
const multer = require('multer');
const UsersControl = require('./Users.controller');
const AuthControl = require('../auth/auth.controller');

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

usersRouter.get('/current', AuthControl.authorize, UsersControl.getCurrentUser);

usersRouter.patch('/', AuthControl.authorize, UsersControl.updateUser);
usersRouter.patch(
  '/avatars',
  AuthControl.authorize,
  upload.single('avatar'),
  UsersControl.updateUserAvatar,
);
module.exports = usersRouter;
