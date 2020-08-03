const Joi = require('@hapi/joi');

const postValidation = {
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  subscription: Joi.string(),
  password: Joi.string(),
  token: Joi.string().empty(''),
};

const createValidation = {
  email: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string(),
  phone: Joi.string().empty(''),
};

const loginValidation = {
  email: Joi.string().required(),
  password: Joi.string().required(),
};

const patchValidation = {
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  subscription: Joi.string(),
  password: Joi.string(),
  token: Joi.string().empty(''),
};

module.exports = {
  createValidation,
  loginValidation,
  patchValidation,
  postValidation,
};
