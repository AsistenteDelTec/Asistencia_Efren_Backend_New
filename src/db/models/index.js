const {Users, UsersSchema} = require('./users.model')

function setupModels(sequelize){
    Users.init(UsersSchema, Users.config(sequelize));
}

module.exports = setupModels;