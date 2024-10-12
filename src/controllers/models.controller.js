const ModelsService = require('../services/models.services');
const service = new ModelsService();

const create = async (req, res) => {
    try {
        const response = await service.create(req);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getPostsByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const response = await service.getPostsByYear(year);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getTopModels = async (req, res) => {
    try {
        const response = await service.getTopRatedModels();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await service.update(id, body);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const _delete = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// New methods for handling dataset URLs
const addDatasetUrl = async (req, res) => {
    try {
        const { modelId } = req.params;
        const { url } = req.body; // Assuming the URL is sent in the body
        const response = await service.addDatasetUrl(modelId, url);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getDatasetUrls = async (req, res) => {
    try {
        const { modelId } = req.params;
        const response = await service.getDatasetUrls(modelId);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const deleteDatasetUrl = async (req, res) => {
    try {
        const { modelId, datasetId } = req.params;
        const response = await service.deleteDatasetUrl(modelId, datasetId);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// New methods for handling paper URLs
const addPaperUrl = async (req, res) => {
    try {
        const { modelId } = req.params;
        const { url } = req.body; // Assuming the URL is sent in the body
        const response = await service.addPaperUrl(modelId, url);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getPaperUrls = async (req, res) => {
    try {
        const { modelId } = req.params;
        const response = await service.getPaperUrls(modelId);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const deletePaperUrl = async (req, res) => {
    try {
        const { modelId, paperId } = req.params;
        const response = await service.deletePaperUrl(modelId, paperId);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    create,
    get,
    getById,
    update,
    getTopModels,
    _delete,
    getPostsByYear,
    addDatasetUrl,
    getDatasetUrls,
    deleteDatasetUrl,
    addPaperUrl,
    getPaperUrls,
    deletePaperUrl
};
