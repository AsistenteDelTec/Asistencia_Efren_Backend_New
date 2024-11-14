const { models } = require('../libs/sequelize');
const { Op, fn, col } = require('sequelize');
const RelationshipUserNewService = require('./relationship_user_new.services');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const { getIo } = require('../config/socket');

class NewsService {
    constructor() {
        this.listFollowUsersService = new ListFollowUsersService();
        this.relationshipUserNewService = new RelationshipUserNewService();
        this.notificationsService = new NotificationsService();
    }

    async create(data) {
        const newsData = {
            news_name: data.body.news_name,
            publish_date: new Date(),
            small_description: data.body.small_description,
            large_description: data.body.large_description,
            url_new: data.body.url_new,
            score: 0,
            cont_views: 0,
            status: 'Accepted',
        };

        const res = await models.News.create(newsData);
        return res;
    }

    async find() {
        const res = await models.News.findAll({
            order: [['id', 'ASC']] // Ordena por 'id' en orden ascendente
        });
        return res;
    }

    async findOne(id) {
        const res = await models.News.findByPk(id);
        return res;
    }

    async getPostsByYear(year) {
        const results = await models.News.findAll({
            attributes: [
                [fn('DATE_TRUNC', 'month', col('publish_date')), 'month'],
                [fn('COUNT', col('id')), 'count'],
            ],
            where: {
                publish_date: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`],
                },
                status: 'Accepted'
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
            const news = await this.findOne(id);
            const previousStatus = news.status;
            const updateNew = await news.update(data);

            const newsData = {
                id: id,
                news_name: updateNew.news_name,
                publish_date: updateNew.publish_date,
                small_description: updateNew.small_description,
                large_description: updateNew.large_description,
                score: updateNew.score,
                url_new: updateNew.url_new,
                version: updateNew.version,
                privated: updateNew.privated,
                cont_views: updateNew.cont_views,
                status: updateNew.status
            };
            if (previousStatus !== 'Accepted' && updateNew.status === 'Accepted') {
                const gUser = await this.relationshipUserNewService.findUser(updateNew.id)
                const followers = await this.listFollowUsersService.getFollowersOfAuthor(gUser.userFound.id);


                for (const follower of followers) {
                    const notification = await this.notificationsService.createNotification({
                        id_user: follower,
                        category: 'NEW',
                        message: `${gUser.userFound.fullname} a publicado la noticia ${updateNew.news_name}.`,
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
            return newsData

        } catch (error) {
            console.error('Error al actualizar el modelo:', error);
            throw error;
        }
    }

    async delete(id) {
        const news = await this.findOne(id);
        await news.destroy();
        return { deleted: true };
    }
}

module.exports = NewsService;
