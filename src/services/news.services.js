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
        const res = await models.News.findAll();
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
        const news = await this.findOne(id);
        const res = await news.update(data);
        return res;
    }

    async delete(id) {
        const news = await this.findOne(id);
        await news.destroy();
        return { deleted: true };
    }
}

module.exports = NewsService;
