const DatasetsService = require('../services/datasets.services')
const service = new DatasetsService();

const create = async (req, res) => {
    try {
        const response = await service.create(req);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

async function getWithPagination(req, res, next) {
    try {
      const { page, limit, search, category, status, privated } = req.query;
      const result = await service.findWithPagination({ page, limit, search, category, status, privated });
      res.json(result);
    } catch (error) {
      next(error);
    }
};


const get = async (req, res) => {
    try {
        const response = await service.findAll();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


const getTopDatasetsByViews = async (req, res) => {
    try {
        const response = await service.getTopViewedDatasets();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getTopDatasetsByCategory = async (req, res) => {
    try {
        const response = await service.getTopDatasetsByCategory();
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
}

const getPostsByYear = async (req, res) => {
    try {
        const {year} = req.params;
        const response = await service.getPostsByYear(year);
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
    create, getWithPagination, get,  getById,getPostsByYear, getTopDatasetsByViews, getTopDatasetsByCategory, update, _delete
};