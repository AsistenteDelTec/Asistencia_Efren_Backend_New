const { Model, DataTypes } = require('sequelize');

const COMMENT_MODEL_TABLE = 'comment_model';

class CommentModel extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: COMMENT_MODEL_TABLE,
            modelName: 'CommentModel',
            timestamps: false
        };
    }
}

const CommentModelSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    id_model: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'models',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    comment: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    dislikes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
};

module.exports = { CommentModel, CommentModelSchema };
