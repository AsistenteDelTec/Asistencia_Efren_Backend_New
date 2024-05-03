const { Users, UsersSchema } = require('./users.model')
const { ListFollowUsers, ListFollowUsersSchema } = require('./list_follow_users.model')
const { Models, ModelsSchema } = require('./models.model')
const { News, NewsSchema } = require('./news.model')
const { Datasets, DatasetsSchema } = require('./datasets.model')
const { RelationshipUserModel, RelationshipUserModelSchema } = require('./relationship_user_model.model')

function setupModels(sequelize) {
    Users.init(UsersSchema, Users.config(sequelize));
    ListFollowUsers.init(ListFollowUsersSchema, ListFollowUsers.config(sequelize));
    Models.init(ModelsSchema, Models.config(sequelize));
    News.init(NewsSchema, News.config(sequelize));
    Datasets.init(DatasetsSchema, Datasets.config(sequelize));
    RelationshipUserModel.init(RelationshipUserModelSchema, RelationshipUserModel.config(sequelize));
}

module.exports = setupModels;