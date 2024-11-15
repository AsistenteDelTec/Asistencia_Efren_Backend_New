const DatasetsService = require('../services/datasets.services');
const RelationshipDatasetUrlPaperService = require('../services/relationship_dataset_url_paper.services'); 
const RelationshipDatasetCategory = require('../services/relationship_dataset_category.services');
const RelationshipUserDataset = require('../services/relationship_user_dataset.services');
const CommentService = require('../services/comment_dataset.services');

const service = new DatasetsService();
const relationshipDatasetUrlPaperService = new RelationshipDatasetUrlPaperService();
const relationshipDatasetCategoryService = new RelationshipDatasetCategory();
const relationshipUserDataset = new RelationshipUserDataset();
const commentServices = new CommentService();

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

const getDatasetWithDetails = async (dataset) => {
    const userRelationship = await relationshipUserDataset.findUser(dataset.id);
    const papersRelationship = await relationshipDatasetUrlPaperService.getUrls(dataset.id);
    const categoriesRelationship = await relationshipDatasetCategoryService.findMyCategories(dataset.id);

    const user = userRelationship ? {
        date_joined: userRelationship.date_joined,
        email: userRelationship.userFound.email,
        fullname: userRelationship.userFound.fullname,
        user_role: userRelationship.userFound.user_role,
        username: userRelationship.userFound.username,
        verified: userRelationship.userFound.verified,
    } : null;

    const papers = papersRelationship ? papersRelationship.map(paper => ({
        url: paper.url,
    })) : [];

    const categories = categoriesRelationship ? categoriesRelationship.map(category => ({
        category_name: category.categories_name,
        visible: category.visible,
    })) : [];

    const datasetInfo = {
        id: dataset.id,
        dataset_name: dataset.dataset_name,
        cont_views: dataset.cont_views,
        description: dataset.description,
        privated: dataset.privated,
        publish_date: dataset.publish_date,
        score: dataset.score,
        status: dataset.status,
        url_source: dataset.url_source,
        version: dataset.version,
        user: user || null, 
        papers: papers || [], 
        categories: categories || [], 
    };

    return {
        dataset: datasetInfo, 
    };
};

const getByStatus = async (req, res) => {
    const { status } = req.query;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    try {
        const datasets = await service.findByStatus(status); 
        const datasetsWithDetails = await Promise.all(datasets.map(getDatasetWithDetails));console.log("res...",datasetsWithDetails)
        res.json({ success: true, datasets: datasetsWithDetails });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

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
        };console.log(response)

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

async function getWithPagination(req, res, next) {
    try {
      const { page, limit, search, category, status, privated } = req.query;
      const result = await service.findWithPagination({ page, limit, search, category, status, privated });
      res.json(result);
    } catch (error) {
      next(error);
    }
};

const getComments = async (req, res) => {
    try{
        const datasetId = req.params.id;
        const comments = await commentServices.findByDataset(datasetId);
        res.status(200).json({success: true, comments});
    }catch(error){
        res.status(500).send({ success: false, message: error.message });
    }
}

const createComment = async (req, res) => {
    try {
        const { id_user, comment } = req.body; 
        const { id } = req.params; //id_dataset

        const commentData = {
            id_user,
            id_dataset: id,  // Assign id from params to id_dataset
            comment
        };

        const result = await commentServices.create(commentData); 

        res.status(201).json({ success: true, data: result.data, message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Error adding comment' });
    }
};

const deleteComment = async (req, res) => {
    try{
        const { id } = req.params; //id_dataset
        const result = await commentServices.delete(id); 

        res.status(201).json({ success: true, data: result.data, message: 'Comment deleted successfully' });
    }catch(error){
        console.error('Error deleting comment:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Error deleting comment' });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await service.update(id, body);
        const dataset = response.data.dataValues;

        // Obtiene información extra del dataset
        const datasetExtraData = {
            user_id: body.user_id,
            datasets: body.url_datasets,
            papers: body.url_papers,
            categories: body.categories,
        };

        // Actualiza lista de papers si es necesario
        if (datasetExtraData.papers && datasetExtraData.papers.length > 0) {
            try {
            // Elimina relaciones anteriores
            await relationshipDatasetUrlPaperService.deleteUrlsByDatasetId(dataset.id);
            // Agrega nuevas relaciones
            await Promise.all(
                datasetExtraData.papers.map(async (paperUrl) => {
                await relationshipDatasetUrlPaperService.addUrl(dataset.id, paperUrl);
                })
            );
            } catch (error) {
            console.error('Error adding paper URLs:', error);
            throw new Error('Error adding paper URLs');
            }
        }

        // Actualiza lista de categorías si es necesario
        if (datasetExtraData.categories && datasetExtraData.categories.length > 0) {
            try {
            // Elimina relaciones anteriores
            await relationshipDatasetCategoryService.deleteByDatasetID(dataset.id);
            // Agrega nuevas relaciones
            await Promise.all(
                datasetExtraData.categories.map(async (category) => {
                await relationshipDatasetCategoryService.create({
                    body: {
                    id_dataset: dataset.id,
                    id_category: category.id,
                    }
                });
                })
            );
            } catch (error) {
            console.error('Error adding categories:', error);
            throw new Error('Error adding categories');
            }
        }

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
    getByStatus,
    update, 
    _delete, 
    addPaperUrl, 
    getPaperUrls, 
    deletePaperUrl,
    getTopDatasetsByCategory,
    getTopDatasetsByViews,
    getTopDatasets,
    getWithPagination,
    createComment,
    getComments,
    deleteComment,
};