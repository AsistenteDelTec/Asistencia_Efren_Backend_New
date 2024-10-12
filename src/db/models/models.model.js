const { Model, DataTypes } = require('sequelize');

const MODELS_TABLE = 'models';

class Models extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: MODELS_TABLE,
            modelName: 'Models',
            timestamps: false
        }
    }
}

const ModelsSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    model_name: {
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
        type: DataTypes.STRING(500),
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
    accuracy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    url_colab: {  
        type: DataTypes.STRING,  
        allowNull: false  
    },
    version: {
        type: DataTypes.STRING(10),
        allowNull: false
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

module.exports = { Models, ModelsSchema };
