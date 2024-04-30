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
        const relations = await models.ListFollowUsers.findAll({
            where: {
                id_user: id
            }
        });
    
        const relatedUsers = await Promise.all(relations.map(async (relation) => {
            const user = await models.Users.findByPk(relation.id_user_follow);
            return user;
        }));
    
        return relatedUsers;
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