const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');

class RelationshipUserDataset {
    constructor() { }

    async create(data) {

        const datos = {
            id_user: data.body.id_user,
            id_dataset: data.body.id_dataset,
        };

        const res = await models.RelationshipUserDataset.create(datos);
        console.log(res);
        return res;
    }

    async find(id) {
        try {
            const user = await models.Users.findByPk(id, {
                include: [
                    {
                        model: models.Datasets,
                        as: 'datasets',
                        where: {
                            status: 'Accepted',
                            privated: 'false'
                        }
                    }
                ]
            });
            return { user };
        } catch (error) {
            console.error('Error fetching user and models:', error);
            throw error;
        }
    }

    async findOne(id, id2) {
        const res = await models.RelationshipUserDataset.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_dataset: id2 }],
            }
        });
        return res;
    }

    async delete(id, id2) {
        const model = await this.findOne(id, id2);
        await model.destroy();
        return { deleted: true };
    }

    async findAll() {
        try {
            const result = await models.RelationshipUserDataset.findAll();
            return result;
        } catch (error) {
            console.error('Error fetching all relationships:', error);
            throw new Error('Failed to retrieve data');
        }
    }
}

module.exports = RelationshipUserDataset;