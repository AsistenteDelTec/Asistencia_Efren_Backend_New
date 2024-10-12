const { Model, DataTypes } = require('sequelize');

const RELATIONSHIP_MODEL_URL_PAPER_TABLE = 'relationship_model_url_paper';

class RelationshipModelUrlPaper extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: RELATIONSHIP_MODEL_URL_PAPER_TABLE,
            modelName: 'RelationshipModelUrlPaper',
            timestamps: false
        };
    }
}

const RelationshipModelUrlPaperSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Models', // This should match the table name of the Models
            key: 'id'
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
};

module.exports = { RelationshipModelUrlPaper, RelationshipModelUrlPaperSchema };
