const {models} = require('../libs/sequelize');
const { Op } = require('sequelize');

class RelationshipUserNews {
    constructor () {}

    async create(data) {

        const datos = {
            id_user: data.body.id_user,
            id_new: data.body.id_new,
        };
        
        const res = await models.RelationshipUserNew.create(datos);
        console.log(res);
        return res;
    }
    
    async find(id) {
        try {
            const user = await models.Users.findByPk(id, {
                include: [
                    {
                        model: models.News,
                        as: 'news',
                        where: {
                            status: 'Accepted',
                            privated: 'false'
                        }
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
        const res = await models.RelationshipUserNew.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_new: id2 }],
            }
        });
        return res;
    }

    async delete(id,id2){
        const model = await this.findOne(id,id2);
        await model.destroy();
        return {deleted: true};
    }
}

module.exports = RelationshipUserNews;