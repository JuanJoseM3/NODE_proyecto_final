const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');

const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');


const categoryExists = catchAsync(async(req, res, next) => {
    const { id } = req.params;

    const category = await Category.findOne({
        where: { id, status: 'active' }
    });

    if(!category) {
        return next(new AppError('The category you are trying to update has not been created', 400));
    };

    req.category = category;
    next();
});

const productExists = catchAsync(async(req, res, next) => {
    const { id } = req.params;

    const product = await Product.findOne({
        where: { id, status: 'active' }
    });

    if(!product) {
        return next(new AppError(`There is no product for the id ${id}`, 403));
    }

    req.product = product;
    next();
});

const protectProductOwner = catchAsync(async(req, res, next) => {
    const { sessionUser, product } = req;

    if(product.userId !== sessionUser.id) {
        return next(new AppError('You didn\'t create this product. You are not authorized to modify it', 403));
    };
    
    next();
})

module.exports = { categoryExists, productExists, protectProductOwner };