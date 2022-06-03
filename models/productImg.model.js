const { db } = require('../utils/database');
const { DataTypes } = require('sequelize');

const ProductImg = db.define('productImg', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    imgUrl: {
        allowNull: true,
        type: DataTypes.STRING
    },
    productId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    status: {
        allowNull: false,
        defaultValue: 'active',
        type: DataTypes.STRING
    }
});

module.exports = { ProductImg };