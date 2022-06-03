const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { ProductImg } = require('../models/productImg.model');

const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const { storage } = require('../utils/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const createProduct = catchAsync(async(req, res, next) => {
    const { title, description, price, quantity, categoryId } = req.body;
    const { sessionUser } = req;

    const categoryExists = await Category.findOne({
        where: { id: categoryId }
    });

    if(!categoryExists) {
        return next(new AppError('The categoryId entered hasn\'t been created yet. Create the category first or introduce an existing category', 400));
    };

    const newProduct = await Product.create({ title, description, price, quantity, categoryId, userId: sessionUser.id });

    const productImgsPromises = req.files.map( async file => {
        const imgRef = ref(storage, `products/${newProduct.id}-${Date.now()}-${file.originalname}`);

        const imgUploaded = await uploadBytes(imgRef, file.buffer);

        return await ProductImg.create({
            productId: newProduct.id,
            imgUrl: imgUploaded.metadata.fullPath
        });
    });

    await Promise.all(productImgsPromises);

    res.status(200).json({ status: 'success', newProduct });
});

const getAllProducts = catchAsync(async(req, res, next) => {
    const products = await Product.findAll({
        where: { status: 'active' },
        include: [
            { model: Category, attributes: ['name'] },
            { model: User, attributes: ['username', 'email'] },
            { model: ProductImg }
        ]
    });

    const productsPromises = products.map(async product => {
        const productImgsPromises = product.productImgs.map(async productImg => {
            const imgRef = ref(storage, productImg.imgUrl);
            const url = await getDownloadURL(imgRef);

            productImg.imgUrl = url;
            return productImg;
        });

        const productImgsResolved = await Promise.all(productImgsPromises);
        product.productImgs = productImgsResolved;

        return product;
    });
   
    const productsResolved = await Promise.all(productsPromises);
    res.status(200).json({ products: productsResolved });
});

const getProductById = catchAsync(async(req, res, next) => {
    const { product } = req;
    res.status(200).json({ product });
});

const updateProduct = catchAsync(async(req, res, next) => {
    const { product } = req;
    const { title, description, price, quantity } = req.body;
    //Solo el creador del producto puede actualizarlo
    await product.update({ title, description, price, quantity });

    res.status(200).json({ status: 'success' });
});

const deleteProduct = catchAsync(async(req, res, next) => {
    const { product } = req;
    await product.update({ status: 'deleted' });

    res.status(200).json({ status: 'success' });
});

const getAllCategories = catchAsync(async(req, res, next) => {
    const categories = await Category.findAll({
        where: { status: 'active' }
    });

    res.status(200).json({ categories });
});

const createCategory = catchAsync(async(req, res, next) => {
    const { name } = req.body;

    const newCategory = await Category.create({ name });

    res.status(200).json({ newCategory });
});

const updateCategory = catchAsync(async(req, res, next) => {
    const { category } = req;
    const { name } = req.body;

    await category.update({ name });

    res.status(200).json({ status: 'success' });
});

module.exports = { createProduct,
                   getAllProducts,
                   getProductById,
                   updateProduct,
                   deleteProduct,
                   getAllCategories,
                   createCategory,
                   updateCategory
};