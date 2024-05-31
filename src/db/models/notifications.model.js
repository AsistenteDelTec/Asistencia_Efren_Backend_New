// models/notification.model.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../libs/sequelize'); // Asegúrate de que la configuración de Sequelize sea correcta

const NOTIFICATIONS_TABLE = 'notifications';

class Notifications extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: NOTIFICATIONS_TABLE,
      modelName: 'Notifications',
      timestamps: false
    };
  }
}

const NotificationsSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  not_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  category: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['TICKET', 'MODEL', 'DATASET', 'NEW', 'FORUM', 'FOLLOWER']]
    }
  },
  to_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
};

module.exports = { Notifications, NotificationsSchema };
