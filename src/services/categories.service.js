const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const { getIo } = require('../config/socket');

class Categories {
    constructor() { }

    async create(data) {
        const datos = {
            categories_name: data.body.categories_name,
            visible: data.body.visible
        };
        const res = await models.Categories.create(datos);
        return res;
    }

    async findOne(id) {
        const res = await models.Categories.findByPk(id);
        return res;
    }

    //TODO: Validar que al eliminar una categoria, tambien elimine la relacion con los modelos
    async delete(id) {
        const model = await this.findOne(id);
        await model.destroy();
        return { deleted: true };
    }

    async findAll() {
        try {
            const result = await models.Categories.findAll();
            return result;
        } catch (error) {
            console.error('Error fetching all relationships:', error);
            throw new Error('Failed to retrieve data');
        }
    }

    async findVisible() {
        try {
            const result = await models.Categories.findAll({
                where: {
                    visible: true,
                }
            });
            return result;
        } catch (error) {
            console.error('Error fetching all relationships:', error);
            throw new Error('Failed to retrieve data');
        }
    }

    async update(id, data) {
        try {
            const model = await this.findOne(id);
            await model.update(data);
        } catch (error) {
            console.error('Error al actualizar categoria:', error);
            throw error;
        }
    }
}

module.exports = Categories;