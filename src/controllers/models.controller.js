const ModelsService = require('../services/models.services');
const RelationshipModelUrlDatasetService = require('../services/relationship_model_url_dataset.services'); 
const RelationshipModelUrlPaperService = require('../services/relationship_model_url_paper.services'); 
const RelationshipModelCategory = require('../services/relationship_model_category.services');
const RelationshipUserModel = require('../services/relationship_user_model.services');
const CommentService = require('../services/comment_model.services');

const service = new ModelsService();
const relationshipModelUrlDatasetService = new RelationshipModelUrlDatasetService();
const relationshipModelUrlPaperService = new RelationshipModelUrlPaperService();
const relationshipModelCategoryService = new RelationshipModelCategory();
const relationshipUserModelService = new RelationshipUserModel();
const commentServices = new CommentService();

const create = async (req, res) => {
    try {
        const response = await service.create(req);
        const id_model = response.data.dataValues.id;

        // Obtiene información extra del modelo
        const modelExtraData = {
            user_id: req.body.user_id,
            datasets: req.body.url_datasets,
            papers: req.body.url_papers,
            categories: req.body.categories,
        };

        // Crea relación modelo - usuario
        try {
            await relationshipUserModelService.create({
            body:{
                id_user: modelExtraData.user_id,
                id_model: id_model,
            }
            });
        } catch (error) {
            console.error('Error creating user-model relationship:', error);
            throw new Error('Error creating user-model relationship');
        }

        // Crea relación modelo - categorias
        if (modelExtraData.categories && Array.isArray(modelExtraData.categories)) {
            try {
            await Promise.all(
                modelExtraData.categories.map(async (category) => {
                await relationshipModelCategoryService.create({
                    body:{
                    id_model: id_model,
                    id_category: category.id,
                    }
                });
                })
            );
            } catch (error) {
            console.error('Error creating model-category relationships:', error);
            throw new Error('Error creating model-category relationships');
            }
        }

        // Crea relación modelo - datasets
        if (modelExtraData.datasets && Array.isArray(modelExtraData.datasets)) {
            try {
            await Promise.all(
                modelExtraData.datasets.map(async (datasetUrl) => {
                await relationshipModelUrlDatasetService.addUrl(id_model, datasetUrl);
                })
            );
            } catch (error) {
            console.error('Error adding dataset URLs:', error);
            throw new Error('Error adding dataset URLs');
            }
        }

        // Crea relación modelo - papers
        if (modelExtraData.papers && Array.isArray(modelExtraData.papers)) {
            try {
            await Promise.all(
                modelExtraData.papers.map(async (paperUrl) => {
                await relationshipModelUrlPaperService.addUrl(id_model, paperUrl);
                })
            );
            } catch (error) {
            console.error('Error adding paper URLs:', error);
            throw new Error('Error adding paper URLs');
            }
        }
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
}

const getModelWithDetails = async (model) => {
    const userRelationship = await relationshipUserModelService.findUser(model.id);
    const datasetsRelationship = await relationshipModelUrlDatasetService.getUrls(model.id);
    const papersRelationship = await relationshipModelUrlPaperService.getUrls(model.id);
    const categoriesRelationship = await relationshipModelCategoryService.findMyCategories(model.id);

    const user = userRelationship ? {
        date_joined: userRelationship.date_joined,
        email: userRelationship.userFound.email,
        fullname: userRelationship.userFound.fullname,
        user_role: userRelationship.userFound.user_role,
        username: userRelationship.userFound.username,
        verified: userRelationship.userFound.verified,
    } : null;

    const datasets = datasetsRelationship ? datasetsRelationship.map(dataset => ({
        url: dataset.url,
    })) : [];

    const papers = papersRelationship ? papersRelationship.map(paper => ({
        url: paper.url,
    })) : [];

    const categories = categoriesRelationship ? categoriesRelationship.map(category => ({
        category_name: category.categories_name,
        visible: category.visible,
    })) : [];

    const modelInfo = {
        id: model.id,
        model_name: model.model_name,
        accuracy: model.accuracy,
        cont_views: model.cont_views,
        large_description: model.large_description,
        privated: model.privated,
        publish_date: model.publish_date,
        score: model.score,
        small_description: model.small_description,
        status: model.status,
        url_colab: model.url_colab,
        version: model.version,
        user: user || null, 
        datasets: datasets || [], 
        papers: papers || [], 
        categories: categories || [], 
    };

    return {
        model: modelInfo, 
    };
};

const getByStatus = async (req, res) => {
    const { status } = req.query; 
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
    }

    try {
        const models = await service.findByStatus(status);
        const modelsWithDetails = await Promise.all(models.map(getModelWithDetails));
        res.json({ success: true, models: modelsWithDetails });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

async function getGroupedCategory(req, res, next) {
    try {
      const { page, limit, search, category, status, privated } = req.query;
      const result = await service.findPages({ page, limit, search, category, status, privated });
      res.json(result);
    } catch (error) {
      next(error);
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

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const model = await service.findOne(id);

        if (!model)
            return res.status(404).send({ success: false, message: 'Model not found' });

        const datasets = await relationshipModelUrlDatasetService.getUrls(id);
        const papers = await relationshipModelUrlPaperService.getUrls(id);
        const categories = await relationshipModelCategoryService.findMyCategories(id);

        const response = {
            ...model.toJSON(),
            datasets: datasets.map(dataset => dataset.url),
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
};

const getByIdWithUser = async (req, res) => {
    try {
        const { id } = req.params;
        const model = await service.findOne(id);

        if (!model)
            return res.status(404).send({ success: false, message: 'Model not found' });

        const datasets = await relationshipModelUrlDatasetService.getUrls(id);
        const papers = await relationshipModelUrlPaperService.getUrls(id);
        const categories = await relationshipModelCategoryService.findMyCategories(id);
        const user = await relationshipUserModelService.findUser(id);

        const response = {
            ...model.toJSON(),
            datasets: datasets.map(dataset => dataset.url),
            papers: papers.map(paper => paper.url),
            categories,
            user: user ? user.userFound : null
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

const getComments = async (req, res) => {
    try{
        const modelId = req.params.id;
        const comments = await commentServices.findByModel(modelId);
        res.status(200).json({success: true, comments});
    }catch(error){
        res.status(500).send({ success: false, message: error.message });
    }
}

const createComment = async (req, res) => {
    try {
        const { id_user, comment } = req.body; 
        const { id } = req.params; //id_model

        const commentData = {
            id_user,
            id_model: id,  // Assign id from params to id_model
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
        const { id } = req.params; //id_model
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
        const model = response.data.dataValues;

        // Obtiene información extra del modelo
        const modelExtraData = {
            datasets: body.url_datasets,
            papers: body.url_papers,
            categories: body.categories,
        };

        // Actualiza lista de datasets si es necesario
        if (modelExtraData.datasets && modelExtraData.datasets.length > 0) {
            try {
            // Elimina relaciones anteriores
            await relationshipModelUrlDatasetService.deleteUrlsByModelId(model.id);
            // Agrega nuevas relaciones
            await Promise.all(
                modelExtraData.datasets.map(async (datasetUrl) => {
                await relationshipModelUrlDatasetService.addUrl(model.id, datasetUrl);
                })
            );
            } catch (error) {
            console.error('Error adding dataset URLs:', error);
            throw new Error('Error adding dataset URLs');
            }
        }

        // Actualiza lista de papers si es necesario
        if (modelExtraData.papers && modelExtraData.papers.length > 0) {
            try {
            // Elimina relaciones anteriores
            await relationshipModelUrlPaperService.deleteUrlsByModelId(model.id);
            // Agrega nuevas relaciones
            await Promise.all(
                modelExtraData.papers.map(async (paperUrl) => {
                await relationshipModelUrlPaperService.addUrl(model.id, paperUrl);
                })
            );
            } catch (error) {
            console.error('Error adding paper URLs:', error);
            throw new Error('Error adding paper URLs');
            }
        }

        // Actualiza lista de categorías si es necesario
        if (modelExtraData.categories && modelExtraData.categories.length > 0) {
            try {
            // Elimina relaciones anteriores
            await relationshipModelCategoryService.deleteByModelID(model.id);
            // Agrega nuevas relaciones
            await Promise.all(
                modelExtraData.categories.map(async (category) => {
                await relationshipModelCategoryService.create({
                    body: {
                    id_model: model.id,
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
    getByStatus,
    getGroupedCategory,
    getById,
    getByIdWithUser,
    getComments,
    createComment,
    update,
    getTopModels,
    getTopModelsByViews,
    getTopModelsByCategory,
    getWithPagination,
    _delete,
    getPostsByYear,
    addDatasetUrl,
    getDatasetUrls,
    deleteDatasetUrl,
    addPaperUrl,
    getPaperUrls,
    deletePaperUrl,
    deleteComment,
};
