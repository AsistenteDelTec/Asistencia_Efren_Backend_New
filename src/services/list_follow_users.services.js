const {models} = require('../libs/sequelize');
const { Op } = require('sequelize');

class ListFollowUsersService {
    constructor () {}

    async create(data) {
        const datos = {
            id_user: data.body.id_user,
            id_user_follow: data.body.id_user_follow,
        };
        const res = await models.ListFollowUsers.create(datos);
        return res;
    }

    async find(id) {
        console.log(id)
        const res = await models.ListFollowUsers.findAll({
            where: {
                id_user:id,
            },
            include: [
                {
                    model: models.User,
                    as: 'userFollow',
                    attributes: ['id', 'name', 'email'] // Atributos del usuario que quieres obtener
                }
            ]
          });
        return res;
    }
    
    async findOne(id,id2){
        const res = await models.ListFollowUsers.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_user_follow: id2 }],
            }});
        return res;
    }

    async update(id,data){
        const model = await this.findOne(id);
        const res = await model.update(data);
        return res;
    }

    async delete(id,id2){
        const model = await this.findOne(id,id2);
        await model.destroy();
        return {deleted: true};
    }
}

module.exports = ListFollowUsersService;