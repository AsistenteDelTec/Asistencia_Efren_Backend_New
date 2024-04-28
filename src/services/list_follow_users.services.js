const {models} = require('../libs/sequelize');

class ListFollowUsersService {
    constructor () {}

    async create(data) {

        console.log(data)
        
        const datos = {
            id_user: data.body.id_user,
            id_user_follow: data.body.id_user_follow,
        };
        console.log(datos)
        const res = await models.ListFollowUsers.create(datos);
        console.log(res.ListFollowUsers);
        return res;
    }

    async find(id) {
        console.log(id)
        const res = await models.ListFollowUsers.findAll({
            where: {
                id_user:id,
            },
          });
        return res;
    }
    
    async findOne(id){
        const res = await models.ListFollowUsers.findByPk(id);
        return res;
    }

    async update(id,data){
        const model = await this.findOne(id);
        const res = await model.update(data);
        return res;
    }

    async delete(id){
        const model = await this.findOne(id);
        await model.destroy();
        return {deleted: true};
    }
}

module.exports = ListFollowUsersService;