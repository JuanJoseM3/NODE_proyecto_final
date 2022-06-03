const { db } = require('../utils/database');
const { DataTypes } = require('sequelize');

const Category = db.define('category', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    status: {
        allowNull: false,
        defaultValue: 'active',
        type: DataTypes.STRING
    }
});

module.exports = { Category };