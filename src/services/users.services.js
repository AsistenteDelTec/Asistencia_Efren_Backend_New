const {models} = require('../libs/sequelize');



class UsersService {
    constructor () {}

    async create(data) {
        
        const datos = {
            username: data.body.username,
            fullname: data.body.fullname,
            password: data.body.password,
            email: data.body.email,
            date_joined: data.body.date_joined,
            verified: data.body.verified,
            user_role: data.body.user_role
        };
        
        const res = await models.Users.create(datos);
        console.log(res.Users);
        return res;
    }
    
    

    async find() {
        const res = await models.Users.findAll();
        return res;
    }
    

    async findOne(id){
        const res = await models.Users.findByPk(id);
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

module.exports = UsersService;