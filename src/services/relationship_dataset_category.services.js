const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const { getIo } = require('../config/socket');

class RelationshipDatasetCategory {
    constructor() { }

    async create(data) {
        const datos = {
            id_dataset: data.body.id_dataset,
            id_category: data.body.id_category,
        };
        console.log("Creando: ", datos)

        const res = await models.RelationshipDatasetCategory.create(datos);
        return res;
    }

    async findMyCategories(id) {
        try {
            const categories = await models.Datasets.findByPk(id, {
                include: [
                    {
                        model: models.Categories,
                        as: 'category',
                        where: { visible: true } // Filtra por categorías visibles
                    }
                ]
            });
            if (!categories) {
                return []
            }

            return categories.category;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    async findOne(id, id2) {
        const res = await models.RelationshipDatasetCategory.findOne({
            where: {
                [Op.and]: [{ id_category: id }, { id_dataset: id2 }],
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
            const result = await models.RelationshipDatasetCategory.findAll();
            return result;
        } catch (error) {
            console.error('Error fetching all relationships:', error);
            throw new Error('Failed to retrieve data');
        }
    }
}

module.exports = RelationshipDatasetCategory;