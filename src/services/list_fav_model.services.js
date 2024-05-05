const {models} = require('../libs/sequelize');
const { Op } = require('sequelize');

class ListFavModelsService {
    constructor () {}

    async create(data) {
        const datos = {
            id_user: data.body.id_user,
            id_model: data.body.id_model,
        };
        const res = await models.ListFavModels.create(datos);
        return res;
    }

    async find(id) {
        try {
            const user = await models.Users.findByPk(id, {
                include: [
                    {
                        model: models.Models,
                        as: 'favModel',
                        include: 
                            {
                                model: models.Users, // Modelo de usuario para el autor
                                as: 'user', // Alias para el autor del modelo
                                attributes: ['fullname'], 
                            },
                    }
                ]
            });
            return {user};
        } catch (error) {
            console.error('Error fetching user and models:', error);
            throw error;
        }
    }
    
    async findOne(id,id2){
        const res = await models.ListFavModels.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_model: id2 }],
            }});
        return res;
    }

    async delete(id,id2){
        const model = await this.findOne(id,id2);
        await model.destroy();
        return {deleted: true};
    }
}

module.exports = ListFavModelsService;