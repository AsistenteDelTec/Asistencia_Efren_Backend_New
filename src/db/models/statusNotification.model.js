// models/statusNotification.model.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../libs/sequelize'); // Asegúrate de que la configuración de Sequelize sea correcta

const STATUS_NOTIFICATIONS_TABLE = 'status_notifications';

class StatusNotification extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: STATUS_NOTIFICATIONS_TABLE,
      modelName: 'StatusNotification',
      timestamps: false
    };
  }
}

const StatusNotificationSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_publish: {
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
  }
};

// StatusNotification.init(StatusNotificationSchema, StatusNotification.config(sequelize));

module.exports = { StatusNotification, StatusNotificationSchema };
