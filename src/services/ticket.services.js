const {models} = require('../libs/sequelize');

class TicketService {
    constructor () {}

    
    async create(data) {
        try {
            const res = await models.Ticket.create(data);
            return res
        } catch (error) {
            throw error;
        }
    }

    async find() {
        const res = await models.Ticket.findAll();
        return res;
    }
    

    async findOne(id){
        const res = await models.Ticket.findByPk(id);
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

module.exports = TicketService;