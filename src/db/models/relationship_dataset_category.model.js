const { Model, DataTypes, Sequelize } = require('sequelize');

const RELATIONSHIP_DATASET_TABLE = 'relationship_dataset_category'

class RelationshipDatasetCategory extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_DATASET_TABLE,
            modelName: 'RelationshipDatasetCategory',
            timestamps: false
        };
    }

}

const RelationshipDatasetCategorySchema = {
    id_dataset: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Datasets', // Nombre del modelo de la tabla de usuarios
            key: 'id'
        }
    },
    id_category: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Categories', // Nombre del modelo de la tabla de modelos
            key: 'id'
        }
    }
}

module.exports = {RelationshipDatasetCategory, RelationshipDatasetCategorySchema };