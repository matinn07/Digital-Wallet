const { DataTypes } = require('sequelize');

module.exports = function UserModel(sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
      },
      email: {
        type: DataTypes.STRING(320),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      dailyTransferLimitCents: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 100000, // default: 1000.00
        field: 'daily_transfer_limit_cents',
      },
    },
    {
      tableName: 'users',
      underscored: true,
    }
  );

  return User;
};

