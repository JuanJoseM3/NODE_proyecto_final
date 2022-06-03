const express = require('express');

const { protectToken } = require('../middlewares/users.middlewares');

const { productExists } = require('../middlewares/products.middlewares');

const { cartExists, userHasCart } = require('../middlewares/carts.middlewares');

const { getUserCart,
        addProductToCart,
        updateCartProduct,
        deleteCartProduct,
        createPurchase
        } = require('../controllers/carts.controller');

const router = express.Router();

router.use(protectToken);

router.get('/', getUserCart);
router.post('/add-product', addProductToCart);

router.post('/purchase', createPurchase);

router.use(cartExists);

router.patch('/update-cart', updateCartProduct);
router.delete('/:productId', deleteCartProduct);

module.exports = { cartsRouter: router };