const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../libs/sequelize');

const OTP_TABLE = 'otp';

class Otp extends Model {}

const OtpSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Ensure this matches your users table name
            key: 'id'
        },
        onDelete: 'CASCADE' // Ensures that OTP records are deleted if the associated user is deleted
    },
    otp_code: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    expiration_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
};

// Initialize the model
Otp.init(OtpSchema, {
    sequelize,
    tableName: OTP_TABLE,
    modelName: 'Otp',
    timestamps: false // Set to false as we handle timestamps manually
});

module.exports = { Otp };
