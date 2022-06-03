const { Cart } = require('../models/cart.model');
const { Order } = require('../models/order.model');
const { Product } = require('../models/product.model');
const { ProductsInCart } = require('../models/productsInCart.model');

const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const { Email } = require('../utils/email');

const getUserCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    const cart = await Cart.findOne({
        where: { userId: sessionUser.id, status: 'active' },
        include: [{ model: ProductsInCart, include: [{ model: Product }] }],
    });

    res.status(200).json({ status: 'success', cart });
});

const addProductToCart = catchAsync(async (req, res, next) => {
    /* const { cart } = req;
    const { productId, quantity } = req.body;

    const product = await Product.findOne({
        where: { id: productId, status: 'active' },
    });

    if (!product) {
        return next(
            new AppError(
                `The product with id ${id} hasn't been created or it was already deleted`,
                403
            )
        );
    }

    if (quantity < 0 || quantity > product.quantity) {
        return next(
            new AppError(
                `You are exceeding the available units of the product. Try a number smaller than ${product.quantity}`
            ),
            403
        );
    }

    const productInCart = await ProductsInCart.findOne({
        where: { productId },
    });

    if (productInCart && productInCart.status === 'active') {
        return next(new AppError('The product is already in your cart', 403));
    }

    if (productInCart && productInCart.status !== 'active') {
        await productInCart.update({ quantity, status: 'active' });
    }

    if (!productInCart) {
        await ProductsInCart.create({ cartId: cart.id, productId, quantity });
        await Product.update(
            {quantity: product.quantity - quantity},
            {where: { id: productId }}
        );
    }

    res.status(200).json({ status: 'success' });
}); */

    const { productId, quantity } = req.body;
    const { sessionUser } = req;

    // Validate that the product exists for the cart
    const product = await Product.findOne({
        where: { id: productId, status: 'active' },
    });

    if (!product) {
        return next(new AppError('Invalid product', 404));
    } else if (quantity > product.quantity) {
        return next(
            new AppError(
                `This product only has ${product.quantity} items available`,
                400
            )
        );
    }

    //Checking the user is not trying to add a negative quantity
    if (quantity < 0) {
        return next(new AppError('Quantity must be a positive number', 400));
    }

    // Fetch current active cart, if it doesn't exist, create a new one
    const cart = await Cart.findOne({
        where: { userId: sessionUser.id, status: 'active' },
    });

    // Create new cart if it doesn't exist
    if (!cart) {
        const newCart = await Cart.create({ userId: sessionUser.id });

        // Add product to the cart
        await ProductsInCart.create({
            cartId: newCart.id,
            productId,
            quantity,
        });
    } else {
        // User already has a cart
        // Validate if product already exists in the cart
        const productInCart = await ProductsInCart.findOne({
            where: { cartId: cart.id, productId },
        });

        // Send error if it exists
        if (productInCart && productInCart.status === 'active') {
            return next(
                new AppError('You already have that product in your cart', 400)
            );
        } else if (productInCart && productInCart.status === 'removed') {
            await productInCart.update({ status: 'active', quantity });
        } else if (!productInCart) {
            // Add product to current cart
            await ProductsInCart.create({
                cartId: cart.id,
                productId,
                quantity,
            });
        }
    }

    res.status(200).json({ status: 'success' });
});

const updateCartProduct = catchAsync(async (req, res, next) => {
    const { cart } = req;
    const { productId, newQty } = req.body;

    //Getting the product to access its available quantity in store which will be updated
    const product = await Product.findOne({
        where: { id: productId, status: 'active' },
    });

    //Checking if the productId corresponds to an existing product
    if (!product) {
        return next(
            new AppError('The product is not available in the store', 403)
        );
    }

    //Looking if the product is in the cart
    const isProductInCart = await ProductsInCart.findOne({
        where: { cartId: cart.id, productId, status: 'active' },
        include: [{ model: Product }],
    });

    //Sending error in case the cart does not contain the product
    if (!isProductInCart) {
        return next(
            new AppError(
                'You are trying to update a product quantity that has not been added to your cart',
                403
            )
        );
    }

    //Checking we are not receiving a negative number or a number greater than the available quantity
    if (newQty < 0 || newQty > product.quantity) {
        return next(
            new AppError(
                `You are exceeding the available units of the product. Try a number smaller than ${product.quantity}`
            ),
            403
        );
    }

    if (newQty === 0) {
        await isProductInCart.update({ quantity: 0, status: 'removed' });
    } else if (newQty > 0) {
        await isProductInCart.update({ quantity: newQty });
    }

    res.status(200).json({ status: 'success' });
});

const deleteCartProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { cart } = req;

    const isProductInCart = await ProductsInCart.findOne({
        where: { cartId: cart.id, productId, status: 'active' },
        include: [{ model: Product }],
    });

    if (!isProductInCart) {
        return next(
            new AppError(
                "You can't delete a product thas hasn't been added to your cart",
                403
            )
        );
    }

    await ProductsInCart.update(
        { status: 'removed' },
        { where: { cartId: cart.id, productId } }
    );

    res.status(200).json({ status: 'success' });
});

const createPurchase = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    // Get user's cart and get products in cart
    const cart = await Cart.findOne({
        where: { status: 'active', userId: sessionUser.id },
        include: [
            {
                model: ProductsInCart,
                where: { status: 'active' },
                include: [{ model: Product }],
            },
        ],
    });

    if (!cart) {
        return next(new AppError('This user does not have a cart yet.', 400));
    }

    // Loop products in cart to do the following (map async)
    let totalPrice = 0;

    const cartPromises = cart.productsInCarts.map(async productInCart => {
        //  Substract to stock
        const updatedQty = productInCart.product.quantity - productInCart.quantity;

        await productInCart.product.update({ quantity: updatedQty });

        //  Calculate total price
        const productPrice = productInCart.quantity * +productInCart.product.price;

        totalPrice += productPrice;

        //  Mark products to status purchased
        return await productInCart.update({ status: 'purchased' });
    });

    await Promise.all(cartPromises);

    // Create order to user
    const newOrder = await Order.create({
        userId: sessionUser.id,
        cartId: cart.id,
        totalPrice,
    });

    await cart.update({ status: 'purchased' });
/* 
    await new Email().sendPurchaseNotice(); */

    res.status(200).json({ status: 'success', newOrder });
});

module.exports = {
    getUserCart,
    addProductToCart,
    updateCartProduct,
    deleteCartProduct,
    createPurchase,
};
