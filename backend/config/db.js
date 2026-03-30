const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize is used for SQL transactions + row-level locking.
// We prefer BIGINT cents to avoid floating point drift.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required (see .env.example).');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  timezone: 'UTC',
});

module.exports = { sequelize, Sequelize };

