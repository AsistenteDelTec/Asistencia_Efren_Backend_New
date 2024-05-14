const UsersService = require('../services/users.services')
const service = new UsersService();

const create = async (req, res) => {
    try {
        const response = await service.create(req);
        res.json({
            user: response.user,
            token: response.token
        })
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });

    }
}

const getCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findComunity(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getCount = async (req, res) => {
    try {
        const {id} = req.params;
        const models = await service.countUserModels(id);
        const datasets = await service.countUserDatasets(id);
        const news = await service.countUserNews(id);
        console.log(news)
        res.json({ 'models': models,'datasets':datasets, 'news':news});
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

const getFollowers = async (req, res) => {
    try {
        const {id} = req.params;
        const numFollowers = await service.countFollowers(id);
        res.json({ 'followers': numFollowers});
    }catch(error){
        res.status(500).send({success: false, message: error.message});
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await service.update(id, body);
        res.json(response)
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const _delete = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

module.exports = {
    create, get, getCommunity, getById,getCount,getFollowers, update, _delete
};