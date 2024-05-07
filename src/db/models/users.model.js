const { Model, DataTypes, Sequelize} = require('sequelize');

const USERS_TABLE = 'users'

class Users extends Model {
    static config(sequelize){
        return {
            sequelize,
            tableName: USERS_TABLE,
            modelName: 'Users',
            timestamps: false
        }
    }
}

const UsersSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    fullname: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    date_joined: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    user_role: {
        type: DataTypes.STRING(15),
        allowNull: false
    }
};


module.exports = { Users, UsersSchema}