const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { Cart } = require('../models/cart.model');
const { ProductsInCart } = require('../models/productsInCart.model');

const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

dotenv.config({ path: './config.env' });

const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.findAll({
        attributes: { exclude: ['password'] },
    });

    res.status(200).json({ users });
});

const createUser = catchAsync(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        username,
        email,
        password: hashPassword,
        role,
    });

    newUser.password = undefined;

    res.status(200).json({ newUser });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        where: { email, status: 'active' },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Invalid credentials', 400));
    }

    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    user.password = undefined;

    res.status(200).json({ token, user });
});

const checkToken = catchAsync(async (req, res, next) => {
    res.status(200).json({ user: req.sessionUser });
});

const getUserPostedProducts = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    const userProducts = await Product.findAll({
        where: { userId: sessionUser.id },
    });

    res.status(200).json({ userProducts });
});

const updateUser = catchAsync(async (req, res, next) => {
    const { user } = req;
    const { username, email } = req.body;

    await user.update({ username, email });

    res.status(200).json({ status: 'success ' });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const { user } = req;

    await user.update({ status: 'deleted' });

    res.status(200).json({ status: 'success' });
});

const getUserPurchases = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    const userOrders = await Order.findAll({
        where: { userId: sessionUser.id },
        include: { model: Cart, include: { model: ProductsInCart } },
    });

    res.status(200).json({ userOrders });
});

const getPurchaseById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const order = await Order.findOne({
        where: { id },
        include: { model: Cart, include: { model: ProductsInCart } },
    });

    res.status(200).json({ order });
});

module.exports = {
    getAllUsers,
    createUser,
    login,
    checkToken,
    getUserPostedProducts,
    updateUser,
    deleteUser,
    getUserPurchases,
    getPurchaseById,
};
