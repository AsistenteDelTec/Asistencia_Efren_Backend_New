const ModelsService = require('../services/models.services');
const RelationshipModelUrlDatasetService = require('../services/relationship_model_url_dataset.services'); 
const RelationshipModelUrlPaperService = require('../services/relationship_model_url_paper.services'); 
const RelationshipModelCategory = require('../services/relationship_model_category.services');

const service = new ModelsService();
const relationshipModelUrlDatasetService = new RelationshipModelUrlDatasetService();
const relationshipModelUrlPaperService = new RelationshipModelUrlPaperService();
const relationshipModelCategoryService = new RelationshipModelCategory();

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

// const get = async (req, res) => {
//     try {
//         const response = await service.find();
//         res.json(response);
//     } catch (error) {
//         res.status(500).send({ success: false, message: error.message });
//     }
// }
async function get(req, res, next) {
    try {
      const { page, limit, search, category, status, privated } = req.query;
      const result = await service.find({ page, limit, search, category, status, privated });
      res.json(result);
    } catch (error) {
      next(error);
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const model = await service.findOne(id);

        if(!model)
            return res.status(404).send({ success: false, message: 'Model not found' });

        const datasets = await relationshipModelUrlDatasetService.getUrls(id);
        const papers = await relationshipModelUrlPaperService.getUrls(id);
        const categories = await relationshipModelCategoryService.findMyCategories(id);

        const response = {
            ...model.toJSON(),
            datasets: datasets.map(dataset => dataset.url),
            papers: papers.map(paper => paper.url),
            categories
        };

        res.json({
            success: true,
            model: response,
        });
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

const getTopModelsByViews = async (req, res) => {
    try {
        const response = await service.getTopViewedModels();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getTopModelsByCategory = async (req, res) => {
    try {
        const response = await service.getTopModelsByCategory();
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
        if (!response) {
            return res.status(404).send({ success: false, message: 'No se pudo actualizar el modelo' });
        }
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

const addDatasetUrl = async (req, res) => {
    try {
        const { modelId } = req.params;
        const { url } = req.body; 
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

const addPaperUrl = async (req, res) => {
    try {
        const { modelId } = req.params;
        const { url } = req.body; 
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
    getTopModelsByViews,
    getTopModelsByCategory,
    _delete,
    getPostsByYear,
    addDatasetUrl,
    getDatasetUrls,
    deleteDatasetUrl,
    addPaperUrl,
    getPaperUrls,
    deletePaperUrl
};
