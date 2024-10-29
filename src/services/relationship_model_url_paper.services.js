const { models } = require('../libs/sequelize');

class RelationshipModelUrlPaperService {
    async addUrl(model_id, url) {
        return await models.RelationshipModelUrlPaper.create({
            model_id,
            url
        });
    }

    async deleteUrl(model_id, paperId) {
        const urlEntry = await models.RelationshipModelUrlPaper.findOne({ where: { model_id, id: paperId } });
        if (urlEntry) {
            await urlEntry.destroy();
            return { deleted: true };
        }
        throw new Error('Paper URL not found');
    }

    async getUrls(model_id) {
        return await models.RelationshipModelUrlPaper.findAll({ where: { model_id } });
    }

    async deleteUrlsByModelId(model_id) {
        await models.RelationshipModelUrlPaper.destroy({ where: { model_id } });
    }

}

module.exports = RelationshipModelUrlPaperService;
