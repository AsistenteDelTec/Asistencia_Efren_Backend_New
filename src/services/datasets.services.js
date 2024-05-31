const { models } = require('../libs/sequelize');
const { Op, fn, col } = require('sequelize');

class DatasetsService {
    constructor() { }

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
        const res = await models.Datasets.findAll();
        return res;
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
        const dataset = await this.findOne(id);
        const res = await dataset.update(data);
        return res;
    }

    async delete(id) {
        const dataset = await this.findOne(id);
        await dataset.destroy();
        return { deleted: true };
    }
}

module.exports = DatasetsService;
