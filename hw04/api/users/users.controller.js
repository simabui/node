const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const usersModel = require('./users.model');
const jwt = require('jsonwebtoken');
const val = require('../validation/validation');

require('dotenv').config();
const SUBS = ['free', 'pro', 'premium'];

class ContactsController {
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

  async authorize(req, res, next) {
    try {
      const authHeader = req.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');

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
  async registerUser(req, res) {
    try {
      const newUser = { ...req.body };
      const existedUser = await usersModel.findOne({
        email: newUser.email,
      });

      if (existedUser)
        return res.status(409).send('User with such email already exists');

      const hashedPass = await bcrypt.hash(newUser.password, 10);

      usersModel.create({ ...newUser, password: hashedPass }, (err, user) => {
        if (err) return console.log(err);
        if (!err) {
          return res
            .status(201)
            .send({ email: user.email, password: user.password });
        }
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

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
}

function handleValidationError(res, val) {
  return res.status(400).send(val.error.message);
}
module.exports = new ContactsController();
