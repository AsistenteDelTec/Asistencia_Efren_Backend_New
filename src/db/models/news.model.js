const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../libs/sequelize');  // Asegúrate de tener la configuración correcta para Sequelize

const NEWS_TABLE = 'news';

class News extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: NEWS_TABLE,
            modelName: 'News',
            timestamps: false
        }
    }
}

const NewsSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    news_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    publish_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    small_description: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    large_description: {
        type: DataTypes.STRING(1500),
        allowNull: false
    },
    url_new: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    score: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        validate: {
            min: 0,
            max: 10
        }
    },
    cont_views: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: [['Accepted', 'Rejected', 'Pending']]
        }
    }
};

module.exports = { News, NewsSchema };
