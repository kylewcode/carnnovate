import { body, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

const createRecipeValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 75 })
    .withMessage("Title must be between 3 and 75 characters.")
    .matches(/^[a-zA-Z0-9 .,!?:;\(\)\-]+$/)
    .withMessage("Title contains invalid characters."),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters.")
    .matches(/^[^<>]*$/)
    .withMessage("Description contains invalid characters."),
  body("ingredients")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Ingredients must be between 5 and 1000 characters.")
    .matches(/^[^<>]*$/)
    .withMessage("Ingredients contains invalid characters."),
  body("instructions")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Instructions must be between 10 and 5000 characters.")
    .matches(/^[^<>]*$/)
    .withMessage("Description contains invalid characters."),
  body("time")
    .isInt({ min: 1, max: 300 })
    .withMessage("Time must be a number between 1 and 300 minutes."),
  body("image")
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage("Invalid image identifier (UUID expected)."),
];

const updateRecipeValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 75 })
    .withMessage("Title must be between 3 and 75 characters.")
    .matches(/^[a-zA-Z0-9 .,!?:;\(\)\-]+$/)
    .withMessage("Title contains invalid characters."),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters.")
    .matches(/^[^<>]*$/)
    .withMessage("Description contains invalid characters."),
  body("ingredients")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Ingredients must be between 5 and 1000 characters.")
    .matches(/^[^<>]*$/)
    .withMessage("Ingredients contains invalid characters."),
  body("instructions")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Instructions must be between 10 and 5000 characters.")
    .matches(/^[^<>]*$/)
    .withMessage("Description contains invalid characters."),
  body("time")
    .isInt({ min: 1, max: 300 })
    .withMessage("Time must be a number between 1 and 300 minutes."),
  body("image")
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage("Invalid image identifier (UUID expected)."),
  body("old_image_url")
    .isURL()
    .withMessage("Invalid URL")
    .optional({ values: "falsy" }),
  body("old_thumbnail_url")
    .isURL()
    .withMessage("Invalid URL")
    .optional({ values: "falsy" }),
];

export {
  handleValidationErrors,
  createRecipeValidation,
  updateRecipeValidation,
};
