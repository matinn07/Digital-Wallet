const { DataTypes } = require('sequelize');

module.exports = function WalletTransactionRecordModel(sequelize) {
  const WalletTransactionRecord = sequelize.define(
    'WalletTransactionRecord',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize.literal('gen_random_uuid()'),
      },
      type: {
        type: DataTypes.ENUM('CREDIT', 'DEBIT', 'TRANSFER'),
        allowNull: false,
      },
      amountCents: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'amount_cents',
      },
      senderUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'sender_user_id',
      },
      receiverUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'receiver_user_id',
      },
      meta: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: 'wallet_transactions',
      underscored: true,
      indexes: [
        { fields: ['sender_user_id'] },
        { fields: ['receiver_user_id'] },
        { fields: ['created_at'] },
      ],
    }
  );

  return WalletTransactionRecord;
};

