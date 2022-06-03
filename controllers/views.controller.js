const path = require('path');

const { Cart } = require('../models/cart.model');
const { ProductsInCart } = require('../models/productsInCart.model');

const { catchAsync } = require('../utils/catchAsync');

const renderIndex = catchAsync(async(req, res, next) => {
    const purchases = await Cart.findAll({
        where: { status: 'purchased' },
        include: { model: ProductsInCart}
    });

    res.status(200).render('emails/baseEmail', { });
});

module.exports = { renderIndex };