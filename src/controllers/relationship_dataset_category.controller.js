const RelationshipDatasetCategory = require('../services/relationship_dataset_category.services');

const service = new RelationshipDatasetCategory();

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

const getMyCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findMyCategories(id);
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
    create, getOne, getMyCategories,_delete, getAll
};