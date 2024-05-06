const { Model, DataTypes } = require('sequelize');

const FAVORITE_DATASETS_TABLE = 'list_fav_datasets';

class ListFavDatasets extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: FAVORITE_DATASETS_TABLE,
            modelName: 'ListFavDatasets',
            timestamps: false
        };
    }
}

const ListFavDatasetsSchema = {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    id_dataset: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'datasets',
            key: 'id'
        }
    }
};

module.exports = { ListFavDatasets, ListFavDatasetsSchema };