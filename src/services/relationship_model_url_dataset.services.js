const { models } = require('../libs/sequelize');

class RelationshipModelUrlDatasetService {
    async addUrl(model_id, url) {
        return await models.RelationshipModelUrlDataset.create({
            model_id,
            url
        });
    }

    async deleteUrl(model_id, datasetId) {
        const urlEntry = await models.RelationshipModelUrlDataset.findOne({ where: { model_id, id: datasetId } });
        if (urlEntry) {
            await urlEntry.destroy();
            return { deleted: true };
        }
        throw new Error('Dataset URL not found');
    }

    async getUrls(model_id) {
        return await models.RelationshipModelUrlDataset.findAll({ where: { model_id } });
    }

    async deleteUrlsByModelId(model_id) {
        await models.RelationshipModelUrlDataset.destroy({ where: { model_id } });
    }

}

module.exports = RelationshipModelUrlDatasetService;
