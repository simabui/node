const fs = require('fs');
const Joi = require('@hapi/joi');
const usersModel = require('./users.model');
const Avatar = require('avatar-builder');
const { promises: fsPromises } = fs;
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
require('dotenv').config();

const SUBS = ['free', 'pro', 'premium'];

class UsersController {
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

  // updatedVerifyToken = async (res, id) => {
  //   try {
  //     await usersModel.findByIdAndUpdate(
  //       id,
  //       { verificationToken: uuidv4() },
  //       { new: true, runValidators: true },
  //     );
  //   } catch (err) {
  //     res.status(400).send(err.message);
  //   }
  // };

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
