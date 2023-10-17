const Sequelize = require('sequelize');
const sequelize = require('./db');

// Define the User model
const User = sequelize.define('User', {
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
});

// Define the Order model
const Order = sequelize.define('Order', {
  product: Sequelize.STRING,
  quantity: Sequelize.INTEGER,
});

// Define associations between User and Order
User.hasMany(Order);
Order.belongsTo(User);

module.exports = {
  User,
  Order,
};
