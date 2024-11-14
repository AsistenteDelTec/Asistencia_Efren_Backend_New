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
const { Ticket, TicketSchema } = require('../models/ticket.model');
const { Notifications, NotificationsSchema } = require('./notifications.model');
const { StatusNotification, StatusNotificationSchema } = require('./statusNotification.model');
const { Categories, CategoriesSchema } = require('./category.model');
const { RelationshipModelCategory, RelationshipModelCategorySchema} = require('./relationship_model_category.model')
const { RelationshipDatasetCategory, RelationshipDatasetCategorySchema} = require('./relationship_dataset_category.model')
const { RelationshipModelUrlDataset, RelationshipModelUrlDatasetSchema } = require('./relationship_model_url_dataset.model');
const { RelationshipModelUrlPaper, RelationshipModelUrlPaperSchema } = require('./relationship_model_url_paper.model');
const { RelationshipDatasetUrlPaper, RelationshipDatasetUrlPaperSchema } = require('./relationship_dataset_url_paper.model');
const { CommentModel, CommentModelSchema } = require('./comment_model.model');
const { CommentDataset, CommentDatasetSchema } = require('./comment_dataset.model');

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
    Notifications.init(NotificationsSchema, Notifications.config(sequelize)); // Inicializar Notification
    StatusNotification.init(StatusNotificationSchema, StatusNotification.config(sequelize)); // Inicializar StatusNotification
    Categories.init(CategoriesSchema, Categories.config(sequelize)); // Inicializar StatusNotification
    RelationshipModelCategory.init(RelationshipModelCategorySchema, RelationshipModelCategory.config(sequelize));
    RelationshipDatasetCategory.init(RelationshipDatasetCategorySchema, RelationshipDatasetCategory.config(sequelize));
    RelationshipModelUrlDataset.init(RelationshipModelUrlDatasetSchema, RelationshipModelUrlDataset.config(sequelize)); 
    RelationshipModelUrlPaper.init(RelationshipModelUrlPaperSchema, RelationshipModelUrlPaper.config(sequelize)); 
    RelationshipDatasetUrlPaper.init(RelationshipDatasetUrlPaperSchema, RelationshipDatasetUrlPaper.config(sequelize)); 
    CommentModel.init(CommentModelSchema, CommentModel.config(sequelize));
    CommentDataset.init(CommentDatasetSchema, CommentDataset.config(sequelize));


    // Definir relaciones
    Users.hasMany(ListFollowUsers, { foreignKey: 'id_user' });
    ListFollowUsers.belongsTo(Users, { foreignKey: 'id_user' });

    Users.belongsToMany(Models, {
        through: RelationshipUserModel,
        foreignKey: 'id_user',
        as: 'models',
        include: {
            model: Models,
            through: { attributes: [] }
        }
    });

    Users.belongsToMany(Datasets, {
        through: RelationshipUserDataset,
        foreignKey: 'id_user',
        as: 'datasets',
        include: {
            model: Datasets,
            through: { attributes: [] }
        }
    });

    Users.belongsToMany(News, {
        through: RelationshipUserNew,
        foreignKey: 'id_user',
        as: 'news',
        include: {
            model: News,
            through: { attributes: [] }
        }
    });

    Users.belongsToMany(Models, {
        through: ListFavModels,
        foreignKey: 'id_user',
        as: 'favModel',
        include: {
            model: Models,
            through: { attributes: [] }
        }
    });

    Users.belongsToMany(Datasets, {
        through: ListFavDatasets,
        foreignKey: 'id_user',
        as: 'favDatasets',
        include: {
            model: Datasets,
            through: { attributes: [] }
        }
    });

    Models.belongsToMany(Users, {
        through: RelationshipUserModel,
        foreignKey: 'id_model',
        as: 'user'
    });


    Models.belongsToMany(Categories, {
        through: RelationshipModelCategory,
        foreignKey: 'id_model',
        as: 'category'
    });

    Datasets.belongsToMany(Categories, {
        through: RelationshipDatasetCategory,
        foreignKey: 'id_dataset',
        as: 'category'
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

    Categories.belongsToMany(Models, {
        through: RelationshipModelCategory,
        foreignKey: 'id_category',
        as:'model'
    })

    Categories.belongsToMany(Datasets, {
        through: RelationshipDatasetCategory,
        foreignKey: 'id_category',
        as:'dataset'
    })

    RelationshipUserModel.belongsTo(Users, { foreignKey: 'id_user' });
    RelationshipUserModel.belongsTo(Models, { foreignKey: 'id_model' });

    RelationshipModelCategory.belongsTo(Categories, { foreignKey: 'id_category' });
    RelationshipModelCategory.belongsTo(Models, { foreignKey: 'id_model' });

    RelationshipDatasetCategory.belongsTo(Categories, { foreignKey: 'id_category' });
    RelationshipDatasetCategory.belongsTo(Datasets, { foreignKey: 'id_dataset' });

    RelationshipUserDataset.belongsTo(Users, { foreignKey: 'id_user' });
    RelationshipUserDataset.belongsTo(Datasets, { foreignKey: 'id_dataset' });

    RelationshipUserNew.belongsTo(Users, { foreignKey: 'id_user' });
    RelationshipUserNew.belongsTo(News, { foreignKey: 'id_new' });

    Users.hasMany(Notifications, { foreignKey: 'id_user' });
    Notifications.belongsTo(Users, { foreignKey: 'id_user' });

    RelationshipModelUrlDataset.belongsTo(Models, { foreignKey: 'model_id' });
    RelationshipModelUrlPaper.belongsTo(Models, { foreignKey: 'model_id' });

    RelationshipDatasetUrlPaper.belongsTo(Datasets, { foreignKey: 'dataset_id' });

    CommentModel.belongsTo(Users, { foreignKey: 'id_user', as: 'user' });
    CommentModel.belongsTo(Models, { foreignKey: 'id_model' });

    CommentDataset.belongsTo(Users, { foreignKey: 'id_user', as: 'user' });
    CommentDataset.belongsTo(Datasets, { foreignKey: 'id_dataset' });

}

module.exports = setupModels;