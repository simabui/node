const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const usersModel = require('../users/users.model');
const nodemailer = require('nodemailer');
const usersController = require('../users/users.controller');
const val = require('../validation/validation');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class AuthController {
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

  registerUser = async (req, res) => {
    try {
      const newUser = { ...req.body };
      const verifyToken = uuidv4();
      const existedUser = await usersModel.findOne({
        email: newUser.email,
      });

      if (existedUser)
        return res.status(409).send('User with such email already exists');

      const hashedPass = await bcrypt.hash(newUser.password, 10);

      await usersController.generateAvatars(newUser.email);
      const imagePath = `localhost:3000/images/${newUser.email}.jpg`;

      this.toVerifyUser(newUser.email, verifyToken);

      usersModel.create(
        {
          ...newUser,
          password: hashedPass,
          avatarURL: imagePath,
          verificationToken: verifyToken,
        },
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

  async verify(req, res) {
    const { verificationToken } = req.params;

    try {
      const user = await usersModel.findOne({ verificationToken });
      if (!user) res.status(404).send('User not found');

      await usersModel.findOneAndUpdate(
        { verificationToken },
        { verificationToken: null },
      );

      res.status(200).send('success verify');
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  async toVerifyUser(email, token) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: `${email}`, // list of receivers
      subject: 'Verify email', // Subject line
      text: '', // plain text body
      html: `<a href=http://localhost:3000/auth/verify/${token}>Click to verify</a>`, // html body
    };

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      if (info) {
        console.log(`E-mail response status - ${info.response}`);
      }
    });
  }
}

module.exports = new AuthController();
