const { models } = require('../libs/sequelize');
const { Op, fn, col } = require('sequelize');
const RelationshipUserDataset = require('./relationship_user_datset.service');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const { getIo } = require('../config/socket');

class DatasetsService {
    constructor() {
        this.listFollowUsersService = new ListFollowUsersService();
        this.relationshipUserDataset = new RelationshipUserDataset();
        this.notificationsService = new NotificationsService();
    }

    async create(data) {
        const datasetData = {
            dataset_name: data.body.dataset_name,
            publish_date: data.body.publish_date,
            description: data.body.description,
            score: data.body.score,
            url_source: data.body.url_source,
            url_paper: data.body.url_paper,
            version: data.body.version,
            privated: data.body.privated,
            cont_views: data.body.cont_views,
            status: data.body.status
        };

        const res = await models.Datasets.create(datasetData);
        return res;
    }

    async find() {
        try{
            const res = await models.Datasets.findAll({
              order: [['id', 'ASC']],
              include: [
                {
                    model: models.Categories,
                    as: 'category',
                    where: { visible: true }, // Filtra por categorías visibles
                    required: false // This makes the join a LEFT JOIN, including datasets without a category
                },
                {
                    model: models.Users,
                    as: 'user',
                    attributes: ['fullname']
                }
              ],
              
            });
            return res;
          } catch (error) {
          console.error('Error fetching data:', error);
          throw error; // Propagate the error if needed
        }
    }

    async findOne(id) {
        const res = await models.Datasets.findByPk(id);
        return res;
    }

    async getPostsByYear(year) {
        const results = await models.Datasets.findAll({
            attributes: [
                [fn('DATE_TRUNC', 'month', col('publish_date')), 'month'],
                [fn('COUNT', col('id')), 'count'],
            ],
            where: {
                publish_date: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`],
                },
                status: 'Accepted',
                privated: 'false'
            },
            group: [fn('DATE_TRUNC', 'month', col('publish_date'))],
            order: [[fn('DATE_TRUNC', 'month', col('publish_date')), 'ASC']],
        });

        const data = results.map(result => ({
            month: result.dataValues.month,
            count: result.dataValues.count,
        }));

        return (data)
    }

    async update(id, data) {
        try {
            const dataset = await this.findOne(id);
            const previousStatus = dataset.status;
            const updateDataset = await dataset.update(data);

            const datasetData = {
                id: id,
                dataset_name: updateDataset.dataset_name,
                publish_date: updateDataset.publish_date,
                description: updateDataset.description,
                score: updateDataset.score,
                url_source: updateDataset.url_source,
                url_paper: updateDataset.url_paper,
                version: updateDataset.version,
                privated: updateDataset.privated,
                cont_views: updateDataset.cont_views,
                status: updateDataset.status
            };

            if (previousStatus !== 'Accepted' && updateDataset.status === 'Accepted') {
                const gUser = await this.relationshipUserDataset.findUser(updateDataset.id)
                const followers = await this.listFollowUsersService.getFollowersOfAuthor(gUser.userFound.id);


                for (const follower of followers) {
                    const notification = await this.notificationsService.createNotification({
                        id_user: follower,
                        category: 'DATASET',
                        message: `${gUser.userFound.fullname} a publicado el set de datos ${updateDataset.dataset_name}.`,
                        not_date: new Date(),
                        to_admin: false
                    });

                    const io = getIo();
                    io.emit('notification', {
                        userId: notification.id_user,
                        message: notification.message,
                        id: notification.id,
                        date: new Date(notification.not_date).toLocaleDateString(),
                        time: new Date(notification.not_date).toLocaleTimeString(),
                        category: notification.category,
                        to_admin: false
                    });
                }
            }

            return datasetData

        } catch (error) {
            console.error('Error al actualizar el modelo:', error);
            throw error;
        }
    }

    async delete(id) {
        const dataset = await this.findOne(id);
        await dataset.destroy();
        return { deleted: true };
    }
}

module.exports = DatasetsService;
