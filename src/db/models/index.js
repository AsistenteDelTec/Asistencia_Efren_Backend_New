const {Users, UsersSchema} = require('./users.model')
const {ListFollowUsers, ListFollowUsersSchema} = require('./list_follow_users.model')

function setupModels(sequelize){
    Users.init(UsersSchema, Users.config(sequelize));
    ListFollowUsers.init(ListFollowUsersSchema, ListFollowUsers.config(sequelize));
}

module.exports = setupModels;