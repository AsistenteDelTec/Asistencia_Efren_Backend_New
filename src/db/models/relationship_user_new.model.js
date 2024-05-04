const { Model, DataTypes, Sequelize} = require('sequelize');

const RELATIONSHIP_MODEL_TABLE = 'relationship_user_new';

class RelationshipUserNew extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_MODEL_TABLE,
            modelName: 'RelationshipUserNew',
            timestamps: false
        };
    }
}

const RelationshipUserNewSchema = {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'users', // Nombre del modelo de la tabla de usuarios
            key: 'id'
        }
    },
    id_new: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'news', // Nombre del modelo de la tabla de noticias
            key: 'id'
        }
    }
};

module.exports = { RelationshipUserNew, RelationshipUserNewSchema };