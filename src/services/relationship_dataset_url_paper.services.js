const { models: datasets } = require('../libs/sequelize');

class RelationshipDatasetUrlPaperService {
    async addUrl(dataset_id, url) {
        return await datasets.RelationshipDatasetUrlPaper.create({
            dataset_id,
            url
        });
    }

    async deleteUrl(dataset_id, paperId) {
        const urlEntry = await datasets.RelationshipDatasetUrlPaper.findOne({ where: { dataset_id, id: paperId } });
        if (urlEntry) {
            await urlEntry.destroy();
            return { deleted: true };
        }
        throw new Error('Paper URL not found');
    }

    async getUrls(dataset_id) {
        return await datasets.RelationshipDatasetUrlPaper.findAll({ where: { dataset_id } });
    }

    async deleteUrlsByDatasetId(dataset_id) {
        await datasets.RelationshipDatasetUrlPaper.destroy({ where: { dataset_id } });
    }

}

module.exports = RelationshipDatasetUrlPaperService;
