const RelationshipModelUrlDatasetService = require('../services/relationship_model_url_dataset.services');

const service = new RelationshipModelUrlDatasetService();

const create = async (req, res) => {
    try {
        const result = await service.create(req.body); 
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const results = await service.findAll(); 
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const { model_id, datasetId } = req.params;
        const result = await service.findOne(model_id, datasetId); 
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: 'Relationship not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const _delete = async (req, res) => {
    try {
        const { model_id, datasetId } = req.params;
        await service.delete(model_id, datasetId); 
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    create,
    getOne,
    _delete,
    getAll,
};
