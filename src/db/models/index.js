const { Users, UsersSchema } = require('./users.model')
const { ListFollowUsers, ListFollowUsersSchema } = require('./list_follow_users.model')
const { Models, ModelsSchema } = require('./models.model')
const { News, NewsSchema } = require('./news.model')
const { Datasets, DatasetsSchema } = require('./datasets.model')
const { RelationshipUserModel, RelationshipUserModelSchema } = require('./relationship_user_model.model')
const { RelationshipUserDataset, RelationshipUserDatasetSchema } = require('./relationship_user_dataset.model')
const { RelationshipUserNew, RelationshipUserNewSchema } = require('./relationship_user_new.model')
const { ListFavModels, ListFavModelsSchema } = require('./list_fav_models.model')
const { ListFavDatasets, ListFavDatasetsSchema } = require('./list_fav_datsets.model')
const { Ticket,TicketSchema } = require('../models/ticket.model');

function setupModels(sequelize) {
    Users.init(UsersSchema, Users.config(sequelize));
    ListFollowUsers.init(ListFollowUsersSchema, ListFollowUsers.config(sequelize));
    Models.init(ModelsSchema, Models.config(sequelize));
    News.init(NewsSchema, News.config(sequelize));
    Datasets.init(DatasetsSchema, Datasets.config(sequelize));
    RelationshipUserModel.init(RelationshipUserModelSchema, RelationshipUserModel.config(sequelize));
    RelationshipUserDataset.init(RelationshipUserDatasetSchema, RelationshipUserDataset.config(sequelize));
    RelationshipUserNew.init(RelationshipUserNewSchema, RelationshipUserNew.config(sequelize));
    ListFavModels.init(ListFavModelsSchema, ListFavModels.config(sequelize));
    ListFavDatasets.init(ListFavDatasetsSchema, ListFavDatasets.config(sequelize));
    Ticket.init(TicketSchema, Ticket.config(sequelize));

    // Definir relaciones
    Users.hasMany(ListFollowUsers, { foreignKey: 'id_user' });
    ListFollowUsers.belongsTo(Users, { foreignKey: 'id_user' });

    Users.belongsToMany(Models, {
        through: RelationshipUserModel,
        foreignKey: 'id_user',
        as: 'models',
        // Incluir directamente la información del modelo sin la información de RelationshipUserModel
        // Utilizando 'include' con 'through'
        include: {
            model: Models,
            through: { attributes: [] } // No seleccionar ninguna columna de RelationshipUserModel
        }
    });

    Users.belongsToMany(Datasets, {
        through: RelationshipUserDataset,
        foreignKey: 'id_user',
        as: 'datasets',
        // Incluir directamente la información del modelo sin la información de RelationshipUserModel
        // Utilizando 'include' con 'through'
        include: {
            model: Datasets,
            through: { attributes: [] } // No seleccionar ninguna columna de RelationshipUserModel
        }
    });

    Users.belongsToMany(News, {
        through: RelationshipUserNew,
        foreignKey: 'id_user',
        as: 'news',
        // Incluir directamente la información del modelo sin la información de RelationshipUserModel
        // Utilizando 'include' con 'through'
        include: {
            model: News,
            through: { attributes: [] } // No seleccionar ninguna columna de RelationshipUserModel
        }
    });

    Users.belongsToMany(Models, {
        through: ListFavModels,
        foreignKey: 'id_user',
        as: 'favModel',
        // Incluir directamente la información del modelo sin la información de RelationshipUserModel
        // Utilizando 'include' con 'through'
        include: {
            model: Models,
            through: { attributes: [] } // No seleccionar ninguna columna de RelationshipUserModel
        }
    });

    Users.belongsToMany(Datasets, {
        through: ListFavDatasets,
        foreignKey: 'id_user',
        as: 'favDatasets',
        // Incluir directamente la información del modelo sin la información de RelationshipUserModel
        // Utilizando 'include' con 'through'
        include: {
            model: Datasets,
            through: { attributes: [] } // No seleccionar ninguna columna de RelationshipUserModel
        }
    });

    Models.belongsToMany(Users, {
        through: RelationshipUserModel,
        foreignKey: 'id_model',
        as: 'user'
    });

    Datasets.belongsToMany(Users, {
        through: RelationshipUserDataset,
        foreignKey: 'id_dataset',
        as: 'user'
    });

    News.belongsToMany(Users, {
        through: RelationshipUserNew,
        foreignKey: 'id_new',
        as: 'users'
    });

    Models.belongsToMany(Users, {
        through: ListFavModels,
        foreignKey: 'id_model',
        as: 'usersFav'
    });

    Datasets.belongsToMany(Users, {
        through: ListFavDatasets,
        foreignKey: 'id_dataset',
        as: 'usersfav'
    });


    RelationshipUserModel.belongsTo(Users, { foreignKey: 'id_user' });
    RelationshipUserModel.belongsTo(Models, { foreignKey: 'id_model' });

    RelationshipUserDataset.belongsTo(Users, { foreignKey: 'id_user' });
    RelationshipUserDataset.belongsTo(Datasets, { foreignKey: 'id_dataset' });

    RelationshipUserNew.belongsTo(Users, { foreignKey: 'id_user' });
    RelationshipUserNew.belongsTo(News, { foreignKey: 'id_new' });

}

module.exports = setupModels;