const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('TherapistFriend', 'postgres', 'root', {
  host: '192.168.15.135',
  dialect: 'postgres',
});

module.exports = sequelize;

