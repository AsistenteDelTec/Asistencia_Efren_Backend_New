const { Model, DataTypes, Sequelize } = require('sequelize');

const RELATIONSHIP_MODEL_TABLE = 'relationship_user_model'

class RelationshipUserModel extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_MODEL_TABLE,
            modelName: 'RelationshipUserModel',
            timestamps: false
        };
    }

}

const RelationshipUserModelSchema = {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Users', // Nombre del modelo de la tabla de usuarios
            key: 'id'
        }
    },
    id_model: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Models', // Nombre del modelo de la tabla de modelos
            key: 'id'
        }
    }
}

module.exports = {RelationshipUserModel,RelationshipUserModelSchema };