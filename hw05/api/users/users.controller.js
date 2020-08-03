const fs = require('fs');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const usersModel = require('./users.model');
const Avatar = require('avatar-builder');
const jwt = require('jsonwebtoken');
const val = require('../validation/validation');
const { promises: fsPromises } = fs;
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');

require('dotenv').config();
const SUBS = ['free', 'pro', 'premium'];

class UsersController {
  validateAddUser(req, res, next) {
    const schema = Joi.object(val.createValidation);
    const validation = schema.validate(req.body);

    if (validation.error) return handleValidationError(res, validation);

    next();
  }
  validateLoginUser(req, res, next) {
    const schema = Joi.object(val.loginValidation);
    const validation = schema.validate(req.body);

    if (validation.error) return handleValidationError(res, validation);

    next();
  }

  validateUpdateContact(req, res, next) {
    const schema = Joi.object(patchValidation);
    const validation = schema.validate(req.body);

    if (validation.error) return handleValidationError(res, validation);

    next();
  }

  generateAvatars = async name => {
    try {
      if (!fs.existsSync('./tmp')) {
        fs.mkdirSync(location, { recursive: true });
      }

      const filepath = `tmp/avatar-${name}.jpg`;
      const avatar = Avatar.catBuilder(128);
      const buffer = await avatar.create('gabriel');
      await fsPromises.writeFile(filepath, buffer);
      this.minifyImage(filepath);
    } catch (err) {
      console.log(err.message);
    }
  };

  async minifyImage(filepath) {
    try {
      await imagemin([filepath], {
        destination: 'public/images',
        plugins: [imageminJpegtran()],
      });
    } catch (err) {
      console.log(err);
    }
  }

  async authorize(req, res, next) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      let userId;

      const JWT_KEY = process.env.JWT_SECRETKEY;

      try {
        userId = await jwt.verify(token, JWT_KEY).id;
      } catch (err) {
        console.log(err);
      }
      const user = await usersModel.findById(userId);

      if (!user || user.token !== token)
        return res.status(401).send('Not Authorize');

      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      console.log(err);
    }
  }
  // POST
  registerUser = async (req, res) => {
    try {
      const newUser = { ...req.body };
      const existedUser = await usersModel.findOne({
        email: newUser.email,
      });

      if (existedUser)
        return res.status(409).send('User with such email already exists');

      const hashedPass = await bcrypt.hash(newUser.password, 10);

      await this.generateAvatars(newUser.email);
      const imagePath = `localhost:3000/images/${newUser.email}.jpg`;

      usersModel.create(
        { ...newUser, password: hashedPass, avatarURL: imagePath },
        (err, user) => {
          if (err) return console.log(err);
          if (!err) {
            return res
              .status(201)
              .send({ email: user.email, password: user.password });
          }
        },
      );
    } catch (err) {
      res.status(400).send(err.message);
    }
  };

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const user = await usersModel.findOne({ email });
      const JWT_KEY = process.env.JWT_SECRETKEY;

      if (!user) return res.status(401).send('Email or password is wrong');

      const isValidPass = await bcrypt.compare(password, user.password);
      if (!isValidPass)
        return res.status(401).send('Email or password is wrong');

      const token = await jwt.sign({ id: user._id }, JWT_KEY, {
        expiresIn: '20 days',
      });

      await usersModel.findByIdAndUpdate(user._id, { token });

      res.status(200).send({
        user: { email: user.email, subscription: user.subscription },
        token,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send();
    }
  }

  async logoutUser(req, res) {
    try {
      const { user } = req;
      await usersModel.findByIdAndUpdate(user._id, { token: null });

      res.status(204).send();
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  // GET
  async getCurrentUser(req, res) {
    try {
      const { user } = req;

      res
        .status(200)
        .send({ email: user.email, subscription: user.subscription });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  // PATCH
  async updateUser(req, res) {
    try {
      const { user } = req;
      const i = SUBS.indexOf(user.subscription);

      const updatedUser = await usersModel.findByIdAndUpdate(
        user._id,
        { subscription: SUBS[i + 1] || 'premium' },
        { new: true, runValidators: true },
      );

      res.status(200).send(updatedUser);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  updateUserAvatar = async (req, res) => {
    try {
      const { filename, path } = req.file;
      const { user } = req;
      const imageURL = `localhost:3000/images/${filename}`;

      this.minifyImage(path);
      const updatedUser = await usersModel.findByIdAndUpdate(
        user._id,
        { avatarURL: imageURL },
        { new: true, runValidators: true },
      );

      res.status(200).send(updatedUser);
    } catch (err) {
      console.log(err);
    }
  };
}

function handleValidationError(res, val) {
  return res.status(400).send(val.error.message);
}
module.exports = new UsersController();
