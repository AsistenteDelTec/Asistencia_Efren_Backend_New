const { Model, DataTypes } = require('sequelize');

const LIST_FAV_MODELS_TABLE = 'list_fav_models';

class ListFavModels extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: LIST_FAV_MODELS_TABLE,
            modelName: 'ListFavModels',
            timestamps: false
        };
    }
}

const ListFavModelsSchema = {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    id_model: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'Models',
            key: 'id'
        }
    }
};

module.exports = { ListFavModels, ListFavModelsSchema };