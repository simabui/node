const { check } = require("express-validator");

const Validator = {
  validateNewsLetterForm() {
    return [check("name").isString().isLength({ min: 3, max: 100 }), check("email").isIn(["javascript", "java", "php"])];
  },
};

module.exports = Validator;
