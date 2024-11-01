const { models } = require('../libs/sequelize');
const { Op, fn, col, Sequelize } = require('sequelize');
const RelationshipUserModelService = require('./relationship_user_model.services');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const RelationshipModelUrlDatasetService = require('./relationship_model_url_dataset.services'); 
const RelationshipModelUrlPaperService = require('./relationship_model_url_paper.services'); 
const RelationshipModelCategoryService = require('./relationship_model_category.services');  

class ModelsService {
  constructor() {
    this.listFollowUsersService = new ListFollowUsersService();
    this.relationshipUserModelService = new RelationshipUserModelService();
    this.notificationsService = new NotificationsService();
    this.datasetUrlService = new RelationshipModelUrlDatasetService(); 
    this.paperUrlService = new RelationshipModelUrlPaperService(); 
    this.relationshipModelCategory = new RelationshipModelCategoryService();
  }

  async create(data) {
    const modelData = {
      model_name: data.body.model_name,
      publish_date: new Date(),
      small_description: data.body.small_description,
      large_description: data.body.large_description,
      score: 0,
      accuracy: data.body.accuracy,
      url_colab: data.body.url_colab,
      version: '1.0.0',
      privated: false,
      cont_views: 0,
      status: 'Pending',
    };
        
    try{
      // Crea modelo y obtiene su ID
      const res = await models.Models.create(modelData);
      const id_model = res.id;

      // Obtiene información extra del modelo
      const modelExtraData = {
        user_id: data.body.user_id,
        datasets: data.body.url_datasets,
        papers: data.body.url_papers,
        categories: data.body.categories,
      };

      // Crea relación modelo - usuario
      try {
        await this.relationshipUserModelService.create({
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
              await this.relationshipModelCategory.create({
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
              await this.datasetUrlService.addUrl(id_model, datasetUrl);
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
              await this.paperUrlService.addUrl(id_model, paperUrl);
            })
          );
        } catch (error) {
          console.error('Error adding paper URLs:', error);
          throw new Error('Error adding paper URLs');
        }
      }
      return { success: true, data: res };
    }catch (error){
      console.error("Error creating model", error.message);
      throw new Error(error.message || "Error creando el modelo");
    }    
  }

  async find() {
    const res = await models.Models.findAll({
      order: [['id', 'ASC']]
    });
    return res;
  }

  async findPages({ page = 1, limit = 10000, search = '', category, status='Accepted', privated=false }) {
    try {
      console.log("Categoria recibida: ", category)
      const offset = (page - 1) * limit;

      // Condiciones del where principal
      const whereConditions = {
        [Op.and]: [
          { model_name: { [Op.iLike]: `%${search}%`} }, // Filtrar por nombre del modelo
          { status },                      // Solo modelos con status 'Accepted'
          { privated }                          // Solo modelos que no sean privados
        ]
      };

      // Si hay un category, agregarlo a las condiciones del where
      if (category) {
        whereConditions[Op.and].push(
          Sequelize.literal(`EXISTS (SELECT 1 FROM "relationship_model_category" AS "RelationshipModelCategory" WHERE "RelationshipModelCategory"."id_model" = "Models"."id" AND "RelationshipModelCategory"."id_category" = ${category})`)
        );
      }
  
      const res = await models.Models.findAndCountAll({
        include: [
          {
            model: models.Categories,
            as: 'category',
            where: { visible: true},   // Filtra por categorías visibles
            required:false
          },
          {
            model: models.Users,
            as: 'user',
            attributes: ['fullname'],
          },
        ],
        
        where:whereConditions,
        limit, // Limita los resultados devueltos
        offset, // Define desde qué registro iniciar
        order: [['id', 'ASC']],
        distinct: true  // Asegura que el conteo sea de modelos únicos, no duplicados por las categorías
      });
      
      console.log({
        totalItems: res.count,
        totalPages: Math.ceil(res.count / limit),
        currentPage: page,
        models: res.rows,  // Modelos devueltos
      })
      return {
        totalItems: res.count,
        totalPages: Math.ceil(res.count / limit),
        currentPage: page,
        models: res.rows,  // Modelos devueltos
      };
    } catch (error) {
      console.error('Error fetching data with pagination:', error);
      throw error;
    }
  }  

  async findOne(id) {
    const res = await models.Models.findByPk(id);
    return res;
  }

  async getPostsByYear(year) {
    const results = await models.Models.findAll({
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

    return data;
  }

  async getTopRatedModels() {
    const topModels = await models.Models.findAll({
      order: [['score', 'DESC']],
      limit: 10,
      where: {
        status: 'Accepted',
        privated: 'false'
      },
    });
    return topModels;
  }

  async getTopViewedModels() {
    const topModels = await models.Models.findAll({
      attributes: ['id', 'model_name', 'accuracy', 'cont_views', 'publish_date'],
      order: [['cont_views', 'DESC']],
      limit: 3,
      where: {
        status: 'Accepted',
        privated: 'false'
      },
      include: [
        {
          model: models.Users,
          as: 'user',
          attributes: ['fullname'],
          through: { attributes: [] },
        },
      ],
    });
    return topModels;
  }

  async getTopModelsByCategory() {
    try {
      // First, find all categories
      const categories = await models.Categories.findAll({
        where: {
            visible: true,
        }
    });
  
      // For each category, fetch the top 3 models based on cont_views
      const topModelsByCategory = await Promise.all(categories.map(async (category) => {
        const topModels = await models.Models.findAll({
          attributes: ['id', 'model_name', 'accuracy', 'cont_views'],
          include: [
            {
              model: models.Categories, // Junction table to link categories with models
              as: 'category', // Alias for the association
              where: { id: category.id }, // Filter by the current category ID
              attributes: [], // No need to retrieve attributes from the junction table
              required:true
            },
            {
              model: models.Users,
              as: 'user',
              attributes: ['fullname'],
              through: { attributes: [] },
            }
          ],
          where: {
            status: 'Accepted',
            privated: false
          },
          order: [['cont_views', 'DESC']],
          limit: 3, // Limit to top 3 models per category
        });
  
        return {
          category:category.categories_name,
          category_id:category.id,
          models:topModels,
        };
      }));
  
      return topModelsByCategory;
    } catch (error) {
      console.error('Error fetching top models:', error);
      throw error;
    }
  }
  
  

  async update(id, data) {
    // Comprueba que el modelo exista
    const model = await models.Models.findByPk(id);
    if (!model) {
        throw new Error('Model not found');
    }

    // Campos que actualiza un usuario
    const userFields = {
      model_name: data.model_name,
      small_description: data.small_description,
      large_description: data.large_description,
      accuracy: data.accuracy,
      url_colab: data.url_colab,
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
    const updatedModelData = {
      ...userFields,
      ...adminFields,
    };

    // Obtiene información extra del modelo
    const modelExtraData = {
      user_id: data.user_id,
      datasets: data.url_datasets,
      papers: data.url_papers,
      categories: data.categories,
    };

    // Se excluyen los campos vacíos
    Object.keys(updatedModelData).forEach(key => {
      if (updatedModelData[key] === undefined) {
        delete updatedModelData[key];
      }
    });

    try{
      // Se actualiza el modelo con solo los campos que sí llevan cambios
      await model.update(updatedModelData);

      // Actualiza lista de datasets si es necesario
      if (modelExtraData.datasets && modelExtraData.datasets.length > 0) {
        try {
          // Elimina relaciones anteriores
          await this.datasetUrlService.deleteUrlsByModelId(model.id);
          // Agrega nuevas relaciones
          await Promise.all(
            modelExtraData.datasets.map(async (datasetUrl) => {
              await this.datasetUrlService.addUrl(model.id, datasetUrl);
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
          await this.paperUrlService.deleteUrlsByModelId(model.id);
          // Agrega nuevas relaciones
          await Promise.all(
            modelExtraData.papers.map(async (paperUrl) => {
              await this.paperUrlService.addUrl(model.id, paperUrl);
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
          await this.relationshipModelCategory.deleteByModelID(model.id);
          // Agrega nuevas relaciones
          await Promise.all(
            modelExtraData.categories.map(async (category) => {
              await this.relationshipModelCategory.create({
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
      return { success: true, data: model };
    }catch (error){
      console.error("Error updating model", error.message);
      throw new Error(error.message || "Error actualizando el modelo");
    }
  }

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { deleted: true };
  }
}

module.exports = ModelsService;
