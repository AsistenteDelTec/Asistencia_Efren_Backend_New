const { Model, DataTypes } = require('sequelize');

const COMMENT_DATASET_TABLE = 'comment_dataset';

class CommentDataset extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: COMMENT_DATASET_TABLE,
            modelName: 'CommentDataset',
            timestamps: false
        };
    }
}

const CommentDatasetSchema = {
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
    id_dataset: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'datasets',
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

module.exports = { CommentDataset, CommentDatasetSchema };
