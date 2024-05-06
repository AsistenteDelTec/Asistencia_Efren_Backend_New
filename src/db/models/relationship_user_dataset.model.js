const { Model, DataTypes, Sequelize } = require('sequelize');

const RELATIONSHIP_MODEL_TABLE = 'relationship_user_dataset';

class RelationshipUserDataset extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_MODEL_TABLE,
            modelName: 'RelationshipUserDataset',
            timestamps: false
        };
    }
}

const RelationshipUserDatasetSchema = {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Users', // Nombre del modelo de la tabla de usuarios
            key: 'id'
        }
    },
    id_dataset: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Datasets', // Nombre del modelo de la tabla de datasets
            key: 'id'
        }
    }
};

module.exports = { RelationshipUserDataset, RelationshipUserDatasetSchema };