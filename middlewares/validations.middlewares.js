const { body, validationResult } = require('express-validator');

const { AppError } = require('../utils/appError');

const createUserValidations = [
    body('username').notEmpty().withMessage('Must provide an user name'),
    body('email')
        .notEmpty()
        .withMessage('Must provide an email for registration')
        .isEmail()
        .withMessage('Must be a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Must define a password for user registration')
        .isLength({ min: 8 })
        .withMessage('Password must contain at least 8 characters'),
];

const createProductValidations = [
    body('title').notEmpty().withMessage('Title cannot be empty'),
    body('description').notEmpty().withMessage('Description cannot be empty'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be greater than 0'),
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be greater than 0'),
    body('categoryId')
        .isInt({ min: 1 })
        .withMessage('Must provide a valid category'),
];

const createCategoryValidations = [
    body('name').notEmpty().withMessage('Name can\'t be empty'),
];

const checkValidations = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const messages = errors.array().map(({ msg }) => msg);

        const errorMsg = messages.join('. ');

        return next(new AppError(errorMsg, 400));
    }

    next();
};

module.exports = {
    createUserValidations,
    createProductValidations,
    createCategoryValidations,
    checkValidations,
};
