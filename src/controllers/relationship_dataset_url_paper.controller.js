const RelationshipDatasetUrlPaperService = require('../services/relationship_model_url_paper.services');

const service = new RelationshipDatasetUrlPaperService();

const create = async (req, res) => {
    try {
        const result = await service.create(req.body); 
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating relationship for paper URL:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const results = await service.findAll(); 
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching relationships for paper URLs:', error);
        res.status(500).json({ message: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const { model_id, paperId } = req.params;
        const result = await service.findOne(model_id, paperId); 
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: 'Relationship not found' });
        }
    } catch (error) {
        console.error('Error fetching relationship for paper URL:', error);
        res.status(500).json({ message: error.message });
    }
};

const _delete = async (req, res) => {
    try {
        const { model_id, paperId } = req.params;
        await service.delete(model_id, paperId); 
        res.status(204).send(); 
    } catch (error) {
        console.error('Error deleting relationship for paper URL:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    create,
    getOne,
    _delete,
    getAll,
};
