const { Model, DataTypes, Sequelize } = require('sequelize');

const RELATIONSHIP_MODEL_TABLE = 'relationship_model_category'

class RelationshipModelCategory extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_MODEL_TABLE,
            modelName: 'RelationshipModelCategory',
            timestamps: false
        };
    }

}

const RelationshipModelCategorySchema = {
    id_model: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Models', // Nombre del modelo de la tabla de usuarios
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

module.exports = {RelationshipModelCategory, RelationshipModelCategorySchema };