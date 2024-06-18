const RelationshipUserModel = require('../services/relationship_user_model.services');

const service = new RelationshipUserModel();

const create = async (req, res) => {
    try {
        const response = await service.create(req);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const get = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.find(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getAll = async (req, res) => {
    try {
        const response = await service.findAll();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getMyModels = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findMyModels(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const { id2 } = req.params;
        const response = await service.findOne(id, id2);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const _delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { id2 } = req.params;
        const response = await service.delete(id, id2);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

module.exports = {
    create, get, getOne, getMyModels,_delete, getAll
};