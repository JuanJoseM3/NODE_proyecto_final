const express = require('express');

const { userExists, protectToken, protectAdmin, protectAccountOwner } = require('../middlewares/users.middlewares');
const { createUserValidations, checkValidations } = require('../middlewares/validations.middlewares');

const { getAllUsers,
        createUser, 
        login,
        checkToken,
        getUserPostedProducts, 
        updateUser, 
        deleteUser, 
        getUserPurchases, 
        getPurchaseById } = require('../controllers/users.controller');

const router = express.Router();

router.post('/', createUserValidations, checkValidations, createUser);
router.post('/login', login);

router.use(protectToken);

router.get('/', getAllUsers);
router.get('/me', getUserPostedProducts);
router.get('/orders', getUserPurchases);
router.get('/check-token', checkToken);
router.patch('/:id', userExists, updateUser);
router.delete('/:id', userExists, deleteUser);
router.get('/orders/:id', getPurchaseById);
router.get('/check-token', checkToken);

module.exports = { usersRouter: router };