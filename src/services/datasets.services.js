const { models } = require('../libs/sequelize');
const { Op, fn, col } = require('sequelize');
const RelationshipUserDataset = require('./relationship_user_dataset.services');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const RelationshipDatasetUrlPaperService = require('./relationship_dataset_url_paper.services'); 
const RelationshipDatasetCategoryService = require('./relationship_dataset_category.services'); 
const { getIo } = require('../config/socket');

class DatasetsService {
    constructor() {
        this.listFollowUsersService = new ListFollowUsersService();
        this.relationshipUserDataset = new RelationshipUserDataset();
        this.notificationsService = new NotificationsService();
        this.paperUrlService = new RelationshipDatasetUrlPaperService(); 
        this.relationshipDatasetCategory = new RelationshipDatasetCategoryService();
    }

    async create(data) {
        const datasetData = {
            dataset_name: data.body.dataset_name,
            publish_date: new Date(),
            description: data.body.description,
            score: 0,
            url_source: data.body.url_source,
            version: '1.0.0',
            privated: false,
            cont_views: 0,
            status: 'Pending',
        };
        try{
            // Crea el dataset y obtiene su ID
            const res = await models.Datasets.create(datasetData);
            const id_dataset = res.id;

            // Obtiene información extra del dataset
            const datasetExtraInfo = {
                id_user: data.body.id_user,
                papers: data.body.url_papers,
                categories: data.body.categories,
            };

            // Crea relación dataset - usuario
            try {
                await this.relationshipUserDataset.create({
                body:{
                    id_user: datasetExtraInfo.id_user,
                    id_dataset: id_dataset,
                }
                });
            } catch (error) {
                console.error('Error creating user-dataset relationship:', error);
                throw new Error('Error creating user-dataset relationship');
            }

            // Crea relación dataset - categorias
            if (datasetExtraInfo.categories && Array.isArray(datasetExtraInfo.categories)) {
                try {
                await Promise.all(
                    datasetExtraInfo.categories.map(async (category) => {
                    await this.relationshipDatasetCategory.create({
                        body:{
                        id_dataset: id_dataset,
                        id_category: category.id,
                        }
                    });
                    })
                );
                } catch (error) {
                console.error('Error creating dataset-category relationships:', error);
                throw new Error('Error creating dataset-category relationships');
                }
            }

            // Crea relación dataset - papers
            if (datasetExtraInfo.papers && Array.isArray(datasetExtraInfo.papers)) {
                try {
                await Promise.all(
                    datasetExtraInfo.papers.map(async (paperUrl) => {
                    await this.paperUrlService.addUrl(id_dataset, paperUrl);
                    })
                );
                } catch (error) {
                console.error('Error adding paper URLs:', error);
                throw new Error('Error adding paper URLs');
                }
            }
            return { success: true, data: res };
        }catch(error){
            console.error("Error creating dataset", error.message);
            throw new Error(error.message || "Error creando el dataset");
        }
    }

    async find() {
        try{
            const res = await models.Datasets.findAll({
              order: [['id', 'ASC']],
              include: [
                {
                    model: models.Categories,
                    as: 'category',
                    where: { visible: true }, // Filtra por categorías visibles
                    required: false // This makes the join a LEFT JOIN, including datasets without a category
                },
                {
                    model: models.Users,
                    as: 'user',
                    attributes: ['fullname']
                }
              ],
              
            });
            return res;
          } catch (error) {
          console.error('Error fetching data:', error);
          throw error; // Propagate the error if needed
        }
    }

    async findOne(id) {
        const res = await models.Datasets.findByPk(id);
        return res;
    }

    async getPostsByYear(year) {
        const results = await models.Datasets.findAll({
            attributes: [
                [fn('DATE_TRUNC', 'month', col('publish_date')), 'month'],
                [fn('COUNT', col('id')), 'count'],
            ],
            where: {
                publish_date: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`],
                },
                status: 'Accepted',
                privated: 'false'
            },
            group: [fn('DATE_TRUNC', 'month', col('publish_date'))],
            order: [[fn('DATE_TRUNC', 'month', col('publish_date')), 'ASC']],
        });

        const data = results.map(result => ({
            month: result.dataValues.month,
            count: result.dataValues.count,
        }));

        return (data)
    }

    async update(id, data) {
        // Comprueba que el dataset exista
        const dataset = await models.Datasets.findByPk(id);
        if (!dataset) {
            throw new Error('Dataset not found');
        }
        // Campos que actualiza un usuario
        const userFields = {
            dataset_name: data.dataset_name,
            description: data.description,
            url_source: data.url_source,
            version: data.version,
            privated: data.privated, 
        };
    
        // Campos que actualiza un admin
        const adminFields = {
            status: data.status,
            publish_date: data.publish_date,
            cont_views: data.cont_views,
        };
    
        // Se combinan todos los campos
        const updatedDatasetData = {
            ...userFields,
            ...adminFields,
        };
    
        // Obtiene información extra del dataset
        const datasetExtraData = {
            user_id: data.user_id,
            datasets: data.url_datasets,
            papers: data.url_papers,
            categories: data.categories,
        };
    
        // Se excluyen los campos vacíos
        Object.keys(updatedDatasetData).forEach(key => {
            if (updatedDatasetData[key] === undefined) {
            delete updatedDatasetData[key];
            }
        });

        try {
            // Se actualiza el dataset con solo los campos que sí llevan cambios
            await dataset.update(updatedDatasetData);

            // Actualiza lista de papers si es necesario
            if (datasetExtraData.papers && datasetExtraData.papers.length > 0) {
                try {
                // Elimina relaciones anteriores
                await this.paperUrlService.deleteUrlsByDatasetId(dataset.id);
                // Agrega nuevas relaciones
                await Promise.all(
                    datasetExtraData.papers.map(async (paperUrl) => {
                    await this.paperUrlService.addUrl(dataset.id, paperUrl);
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
                await this.relationshipDatasetCategory.deleteByDatasetID(dataset.id);
                // Agrega nuevas relaciones
                await Promise.all(
                    datasetExtraData.categories.map(async (category) => {
                    await this.relationshipDatasetCategory.create({
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
            return { success: true, data: dataset };
        } catch (error) {
            console.error("Error updating dataset", error.message);
            throw new Error(error.message || "Error actualizando el dataset");
        }
    }

    async delete(id) {
        const dataset = await this.findOne(id);
        await dataset.destroy();
        return { deleted: true };
    }
}

module.exports = DatasetsService;
