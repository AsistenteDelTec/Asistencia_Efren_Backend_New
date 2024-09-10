// models/statusNotification.model.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../libs/sequelize'); // Asegúrate de que la configuración de Sequelize sea correcta

const CATEGORIES_TABLE = 'categories';

class Categories extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: CATEGORIES_TABLE,
      modelName: 'Categories',
      timestamps: false
    };
  }
}

const CategoriesSchema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categories_name: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  visible: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
};

// StatusNotification.init(StatusNotificationSchema, StatusNotification.config(sequelize));

module.exports = { Categories, CategoriesSchema};
