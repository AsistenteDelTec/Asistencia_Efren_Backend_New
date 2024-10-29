const { Model, DataTypes } = require('sequelize');

const RELATIONSHIP_DATASET_URL_PAPER_TABLE = 'relationship_dataset_url_paper';

class RelationshipDatasetUrlPaper extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_DATASET_URL_PAPER_TABLE,
            modelName: 'RelationshipDatasetUrlPaper',
            timestamps: false
        };
    }
}

const RelationshipDatasetUrlPaperSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dataset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Datasets', // This should match the table name of the Datasets
            key: 'id'
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
};

module.exports = { RelationshipDatasetUrlPaper, RelationshipDatasetUrlPaperSchema };
