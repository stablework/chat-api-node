const { body, validationResult } = require("express-validator");
const { _unprocessable } = require("./common");

const validation = (data) => {
  switch (data) {
    case "login":
      return [
        body("email").trim().notEmpty().withMessage("Name is required"),
        body("password")
          .trim()
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 6 })
          .withMessage("Password must be minimum 6 character"),
      ];
    case "join":
      return [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("password")
          .trim()
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 6 })
          .withMessage("Password must be minimum 6 character"),
      ];
    default:
      return [];
  }
};

const validate = (data) => {
  return async (req, res, next) => {
    const validations = validation(data);
    for (let item of validations) {
      await item.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return _unprocessable(
      res,
      "Validation failed",
      errors.array().reduce((result, error) => {
        const field = error.path || error.param || "form";
        if (!result[field]) {
          result[field] = [];
        }
        result[field].push(error.msg);
        return result;
      }, {})
    );
  };
};

module.exports = validate;
