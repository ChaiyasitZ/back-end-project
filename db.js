const Sequelize = require('sequelize');

const dbUrl = 'postgres://webadmin:YKKgle22587@10.104.15.125:5432/Books'
const sequelize = new Sequelize(dbUrl);

module.exports = sequelize;
