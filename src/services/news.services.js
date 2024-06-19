const { models } = require('../libs/sequelize');
const { Op, fn, col } = require('sequelize');

class NewsService {
    constructor() { }

    async create(data) {
        const newsData = {
            news_name: data.body.news_name,
            publish_date: data.body.publish_date,
            small_description: data.body.small_description,
            large_description: data.body.large_description,
            url_new: data.body.url_new,
            score: data.body.score,
            cont_views: data.body.cont_views,
            status: data.body.status
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
