const { DataTypes } = require('sequelize');

module.exports = function WalletModel(sequelize) {
  const Wallet = sequelize.define(
    'Wallet',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        unique: true,
      },
      balanceCents: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        field: 'balance_cents',
        validate: {
          min: 0,
        },
      },
    },
    {
      tableName: 'wallets',
      underscored: true,
    }
  );

  return Wallet;
};

