const { Cart } = require('../models/cart.model');
const { AppError } = require('../utils/appError');

const { catchAsync } = require('../utils/catchAsync');

const cartExists = catchAsync(async(req, res, next) => {
    const { sessionUser } = req;

    const cart = await Cart.findOne({
        where: { userId: sessionUser.id, status: 'active' }
    });

    if(!cart) {
        return next(new AppError('You can\'t update or delete products from your cart because you have not added products to the cart', 403));
    }

    req.cart = cart;
    next();
});

/* const userHasCart = catchAsync(async(req, res, next) => {
    const { sessionUser } = req;

    const cart = await Cart.findOne({
        where: { userId: sessionUser.id, status: 'active' }
    });

    if(!cart) {
        const newCart = await Cart.create({ userdId: sessionUser.id });
    }

    req.cart = cart;
    next();
}); */

module.exports = { cartExists };