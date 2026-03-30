const { sequelize } = require('../config/db');

const UserModel = require('./User');
const WalletModel = require('./Wallet');
const WalletTransactionRecordModel = require('./WalletTransactionRecord');

const User = UserModel(sequelize);
const Wallet = WalletModel(sequelize);
const WalletTransactionRecord = WalletTransactionRecordModel(sequelize);

// Associations
User.hasOne(Wallet, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WalletTransactionRecord, {
  foreignKey: 'senderUserId',
  as: 'sentTransactions',
});
User.hasMany(WalletTransactionRecord, {
  foreignKey: 'receiverUserId',
  as: 'receivedTransactions',
});

WalletTransactionRecord.belongsTo(User, { foreignKey: 'senderUserId', as: 'sender' });
WalletTransactionRecord.belongsTo(User, { foreignKey: 'receiverUserId', as: 'receiver' });

module.exports = { sequelize, User, Wallet, WalletTransactionRecord };

