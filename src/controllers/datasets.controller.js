const DatasetsService = require('../services/datasets.services');
const RelationshipDatasetUrlPaperService = require('../services/relationship_dataset_url_paper.services'); 
const RelationshipDatasetCategory = require('../services/relationship_dataset_category.services');
const RelationshipUserDataset = require('../services/relationship_user_dataset.services');

const service = new DatasetsService();
const relationshipDatasetUrlPaperService = new RelationshipDatasetUrlPaperService();
const relationshipDatasetCategoryService = new RelationshipDatasetCategory();
const relationshipUserDataset = new RelationshipUserDataset();

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
        const dataset = await service.findOne(id);

        if (!dataset)
            return res.status(404).send({ success: false, message: 'Dataset not found' });

        const papers = await relationshipDatasetUrlPaperService.getUrls(id);
        const categories = await relationshipDatasetCategoryService.findMyCategories(id);

        const response = {
            ...dataset.toJSON(),
            papers: papers.map(paper => paper.url),
            categories,
        };

        res.json({
            success: true,
            model: response,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const dataset = await service.findOne(id);

        if (!dataset)
            return res.status(404).send({ success: false, message: 'Dataset not found' });

        const papers = await relationshipDatasetUrlPaperService.getUrls(id);
        const categories = await relationshipDatasetCategoryService.findMyCategories(id);

        const response = {
            ...dataset.toJSON(),
            papers: papers.map(paper => paper.url),
            categories,
        };

        res.json({
            success: true,
            dataset: response,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });

    }
}

const getByIdWithUser = async (req, res) => {
    try {
        const { id } = req.params;
        const dataset = await service.findOne(id);

        if (!dataset)
            return res.status(404).send({ success: false, message: 'Dataset not found' });

        const papers = await relationshipDatasetUrlPaperService.getUrls(id);
        const categories = await relationshipDatasetCategoryService.findMyCategories(id);
        const user = await relationshipUserDataset.findUser(id);

        const response = {
            ...dataset.toJSON(),
            papers: papers.map(paper => paper.url),
            categories,
            user: user ? user.userFound : null
        };

        res.json({
            success: true,
            dataset: response,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

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
        if (!response) {
            return res.status(404).send({ success: false, message: 'No se pudo actualizar el dataset' });
        }
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

const addPaperUrl = async (req, res) => {
    try {
        const { datasetId } = req.params;
        const { url } = req.body; 
        const response = await service.addPaperUrl(datasetId, url);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getPaperUrls = async (req, res) => {
    try {
        const { datasetId } = req.params;
        const response = await service.getPaperUrls(datasetId);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const deletePaperUrl = async (req, res) => {
    try {
        const { datasetId, paperId } = req.params;
        const response = await service.deletePaperUrl(datasetId, paperId);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    create, 
    get, 
    getById, 
    getByIdWithUser, 
    getPostsByYear, 
    update, 
    _delete, 
    addPaperUrl, 
    getPaperUrls, 
    deletePaperUrl,
};