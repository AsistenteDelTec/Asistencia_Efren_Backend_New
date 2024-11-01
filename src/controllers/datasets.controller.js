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
        const id_dataset = response.dataValues.id;

        // Información extra del dataset
        const { id_user, url_papers, categories } = req.body;

        // Crea relación Dataset-Usuario
        try {
            await service.relationshipUserDataset.create({
                body:{
                    id_user: id_user,
                    id_dataset: id_dataset,
                }
            });
        } catch (error) {
            console.error('Error creating user-dataset relationship:', error);
            return res.status(500).json({ success: false, message: 'Error creating user-dataset relationship' });
        }

        // Crea relación Dataset-Categorías
        if (categories && Array.isArray(categories)) {
            try {
                await Promise.all(
                    categories.map(async (category) => {
                        await service.relationshipDatasetCategory.create({
                            body:{
                                id_dataset: id_dataset,
                                id_category: category.id,
                            }
                        });
                    })
                );
            } catch (error) {
                console.error('Error creating dataset-category relationships:', error);
                return res.status(500).json({ success: false, message: 'Error creating dataset-category relationships' });
            }
        }

        // Crea relación Dataset-Papers
        if (url_papers && Array.isArray(url_papers)) {
            try {
                await Promise.all(
                    url_papers.map(async (paperUrl) => {
                        await service.paperUrlService.addUrl(id_dataset, paperUrl);
                    })
                );
            } catch (error) {
                console.error('Error adding paper URLs:', error);
                return res.status(500).json({ success: false, message: 'Error adding paper URLs' });
            }
        }

        res.json({ success: true, data: response });
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

async function getGroupedCategory(req, res, next) {
    try {
      const { page, limit, search, category, status, privated } = req.query;
      const result = await service.findPages({ page, limit, search, category, status, privated });
      res.json(result);
    } catch (error) {
      next(error);
    }
};

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

const getTopDatasets = async (req, res) => {
    try {
        const response = await service.getTopRatedDatasets();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

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
    getGroupedCategory,
    getById, 
    getByIdWithUser, 
    getPostsByYear, 
    update, 
    _delete, 
    addPaperUrl, 
    getPaperUrls, 
    deletePaperUrl,
    getTopDatasetsByCategory,
    getTopDatasetsByViews,
    getTopDatasets,
};