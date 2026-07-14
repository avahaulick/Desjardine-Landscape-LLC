const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const validateUrl = (value, helpers) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    return helpers.message('Field must contain a valid URL.');
  }
  return value;
};

const emailRule = Joi.string().required().email();
const passwordRule = Joi.string().required().min(8);

const createUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(validateUrl),
    email: emailRule,
    password: passwordRule,
  }),
});

const loginValidation = celebrate({
  body: Joi.object().keys({
    email: emailRule,
    password: Joi.string().required(),
  }),
});

const updateUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(validateUrl),
  }),
});

const itemBodyValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    imageUrl: Joi.string().required().custom(validateUrl),
    weather: Joi.string().required().valid('hot', 'warm', 'cold'),
  }),
});

const itemIdValidation = celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().hex().length(24),
  }),
});

module.exports = {
  createUserValidation,
  loginValidation,
  updateUserValidation,
  itemBodyValidation,
  itemIdValidation,
};
