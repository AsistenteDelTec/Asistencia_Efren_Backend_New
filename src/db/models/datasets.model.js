const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../libs/sequelize');  // Asegúrate de tener la configuración correcta para Sequelize

const DATASETS_TABLE = 'datasets';

class Datasets extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: DATASETS_TABLE,
            modelName: 'Datasets',
            timestamps: false
        }
    }
}

const DatasetsSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dataset_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    publish_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    description: {
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
    url_source: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    version: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    privated: {
        type: DataTypes.BOOLEAN,
        allowNull: false
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

module.exports = { Datasets, DatasetsSchema };
