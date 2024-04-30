const { models } = require('../libs/sequelize');

class ModelsService {
    constructor() { }

    async create(data) {
        const modelData = {
            model_name: data.body.model_name,
            publish_date: data.body.publish_date,
            small_description: data.body.small_description,
            large_description: data.body.large_description,
            score: data.body.score,
            accuracy: data.body.accuracy,
            url_colab: data.body.url_colab,
            url_dataset: data.body.url_dataset,
            url_paper: data.body.url_paper,
            version: data.body.version,
            privated: data.body.privated,
            cont_views: data.body.cont_views,
            status: data.body.status
        };

        const res = await models.Models.create(modelData);
        return res;
    }

    async find() {
        const res = await models.Models.findAll();
        return res;
    }

    async findOne(id) {
        const res = await models.Models.findByPk(id);
        return res;
    }

    async update(id, data) {
        const model = await this.findOne(id);
        const res = await model.update(data);
        return res;
    }

    async delete(id) {
        const model = await this.findOne(id);
        await model.destroy();
        return { deleted: true };
    }
}

module.exports = ModelsService;