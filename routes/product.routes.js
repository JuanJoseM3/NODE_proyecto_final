const express = require('express');

const { createCategoryValidations, 
        createProductValidations, 
        checkValidations } = require('../middlewares/validations.middlewares');

const { protectToken } = require('../middlewares/users.middlewares');

const { categoryExists,
        productExists,
        protectProductOwner } = require('../middlewares/products.middlewares');

const { createProduct,
        getAllProducts,
        getProductById,
        updateProduct,
        deleteProduct,
        getAllCategories,
        createCategory,
        updateCategory } = require('../controllers/products.controller');

const { upload } = require('../utils/multer');

const router = express.Router();

router.get('/', getAllProducts);

router.use(protectToken);

router.post('/', upload.array('productImgs'), createProductValidations, checkValidations, createProduct);
router.get('/categories', getAllCategories);
router.get('/:id', productExists, getProductById);

router.post('/categories', createCategoryValidations, createCategory);
router.patch('/categories/:id', categoryExists, updateCategory);

router.patch('/:id', productExists, protectProductOwner, updateProduct);
router.delete('/:id', productExists, protectProductOwner, deleteProduct);

module.exports = { productsRouter: router };