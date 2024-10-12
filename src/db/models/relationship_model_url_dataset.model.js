const { Model, DataTypes } = require('sequelize');

const RELATIONSHIP_MODEL_URL_DATASET_TABLE = 'relationship_model_url_dataset';

class RelationshipModelUrlDataset extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_MODEL_URL_DATASET_TABLE,
            modelName: 'RelationshipModelUrlDataset',
            timestamps: false
        };
    }
}

const RelationshipModelUrlDatasetSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Models', 
            key: 'id'
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
};

module.exports = { RelationshipModelUrlDataset, RelationshipModelUrlDatasetSchema };
