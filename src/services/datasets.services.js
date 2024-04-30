const { models } = require('../libs/sequelize');

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
