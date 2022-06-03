const { Cart } = require('./cart.model');
const { Category } = require('./category.model');
const { Order } = require('./order.model');
const { Product } = require('./product.model');
const { ProductImg } = require('./productImg.model');
const { ProductsInCart } = require('./productsInCart.model');
const { User } = require('./user.model');

const initModels = () => {

    User.hasMany(Product);
    Product.belongsTo(User);

    User.hasMany(Order);
    Order.belongsTo(User);

    User.hasOne(Cart);
    Cart.belongsTo(User);

    Product.hasMany(ProductImg);
    ProductImg.belongsTo(Product);

    Category.hasOne(Product);
    Product.belongsTo(Category);

    Cart.hasMany(ProductsInCart);
    ProductsInCart.belongsTo(Cart);

    Product.hasOne(ProductsInCart);
    ProductsInCart.belongsTo(Product);

    Cart.hasOne(Order);
    Order.belongsTo(Cart);
};

module.exports = { initModels };