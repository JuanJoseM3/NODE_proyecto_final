const jwt = require('jsonwebtoken');

const { User } = require('../models/user.model');

const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const userExists = catchAsync(async(req, res, next) => {
    const { id } = req.params;

    const user = await User.findOne({
        where: { id, status: 'active' },
        attributes: { exclude: ['password'] }
    });

    if(!user) {
        return next(new AppError(`Could not find user for the id ${id}`, 400));
    }

    req.user = user;
    next();
});

const protectToken = catchAsync(async(req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new AppError('Session invalid', 403));
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
        where: { id: decoded.id, status: 'active'}
    });

    if(!user) {
        return next(new AppError('The owner of this token is no longer available', 403));
    }

    req.sessionUser = user;
    next();
});

const protectAdmin = catchAsync(async(req, res, next) => {
    if(req.sessionUser.role !== 'admin') {
        return next(new AppError('Access not granted', 403));
    }
});

const protectAccountOwner = catchAsync(async(req, res, next) => {
    const { sessionUser, user } = req;

    if(sessionUser.id !== user.id) {
        return next(new AppError('Yo do not own this account', 403));
    }

    next();
})

module.exports = { userExists, protectToken, protectAdmin, protectAccountOwner };