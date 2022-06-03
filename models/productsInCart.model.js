const { db } = require('../utils/database');
const { DataTypes } = require('sequelize');

const ProductsInCart = db.define('productsInCart', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    cartId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    productId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    quantity: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    status: {
        allowNull: false,
        defaultValue: 'active',
        type: DataTypes.STRING
    }
});

module.exports = { ProductsInCart };