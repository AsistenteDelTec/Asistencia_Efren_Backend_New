const Categories = require('../services/categories.service');

const service = new Categories();

const create = async (req, res) => {
    try {
        const response = await service.create(req);
        res.json({ success: true, data: response });
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

const getVisible = async (req, res) => {
    try {
        const response = await service.findVisible();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
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

const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
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
    create, getOne, getAll, getVisible , _delete, update
};