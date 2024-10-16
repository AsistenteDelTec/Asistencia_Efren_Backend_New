const { models } = require('../libs/sequelize');
const { Op, fn, col, Sequelize } = require('sequelize');
const RelationshipUserModelService = require('./relationship_user_model.services');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const RelationshipModelUrlDatasetService = require('./relationship_model_url_dataset.services'); 
const RelationshipModelUrlPaperService = require('./relationship_model_url_paper.services');   

class ModelsService {
  constructor() {
    this.listFollowUsersService = new ListFollowUsersService();
    this.relationshipUserModelService = new RelationshipUserModelService();
    this.notificationsService = new NotificationsService();
    this.datasetUrlService = new RelationshipModelUrlDatasetService(); 
    this.paperUrlService = new RelationshipModelUrlPaperService(); 
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

    const res = await models.Models.create(modelData);

    if (data.body.url_datasets && Array.isArray(data.body.url_datasets)) {
        try {
            await Promise.all(
                data.body.url_datasets.map(async (datasetUrl) => {
                    await this.datasetUrlService.addUrl(res.id, datasetUrl);
                })
            );
        } catch (error) {
            console.error('Error adding dataset URLs:', error);
            throw new Error('Error adding dataset URLs');
        }
    }

    if (data.body.url_papers && Array.isArray(data.body.url_papers)) {
        try {
            await Promise.all(
                data.body.url_papers.map(async (paperUrl) => {
                    await this.paperUrlService.addUrl(res.id, paperUrl);
                })
            );
        } catch (error) {
            console.error('Error adding paper URLs:', error);
            throw new Error('Error adding paper URLs');
        }
    }
    return res;
  }

  // async find() {
  //   try{
  //     const res = await models.Models.findAll({
  //       order: [['id', 'ASC']],
  //       include: [
  //         {
  //             model: models.Categories,
  //             as: 'category',
  //             where: { visible: true }, // Filtra por categorías visibles
  //             required: false // This makes the join a LEFT JOIN, including datasets without a category
  //         },
  //         {
  //             model: models.Users,
  //             as: 'user',
  //             attributes: ['fullname']
  //         }
  //       ],
        
  //     });
  //     return res;
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     throw error; // Propagate the error if needed
  //   }
  // }

  async find({ page = 1, limit = 10000, search = '', category, status='Accepted', privated=false }) {
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

  async update(id, data) {
    const model = await models.Models.findByPk(id);
    if (!model) {
        throw new Error('Model not found');
    }

    const userFields = {
      model_name: data.model_name,
      small_description: data.small_description,
      large_description: data.large_description,
      accuracy: data.accuracy,
      url_colab: data.url_colab,
      version: data.version,
      privated: data.privated, 
      // Other fields that should be updated by the user
    };

    // Additional fields that can be updated by an admin
    const adminFields = {
      cont_views: data.cont_views,
      status: data.status,
      publish_date: data.publish_date,
    };

    // Merge the user fields with the admin fields
    const updatedModelData = {
      ...userFields,
      ...adminFields,
    };

    // Only include fields that are provided in the request
    Object.keys(updatedModelData).forEach(key => {
      if (updatedModelData[key] === undefined) {
        delete updatedModelData[key];
      }
    });

    await model.update(updatedModelData);

    if (data.url_datasets && Array.isArray(data.url_datasets)) {
        await this.datasetUrlService.removeUrlsByModelId(model.id);

        try {
            await Promise.all(
                data.url_datasets.map(async (datasetUrl) => {
                    await this.datasetUrlService.addUrl(model.id, datasetUrl);
                })
            );
        } catch (error) {
            console.error('Error adding dataset URLs:', error);
            throw new Error('Error adding dataset URLs');
        }
    }

    if (data.url_papers && Array.isArray(data.url_papers)) {
        await this.paperUrlService.removeUrlsByModelId(model.id);

        try {
            await Promise.all(
                data.url_papers.map(async (paperUrl) => {
                    await this.paperUrlService.addUrl(model.id, paperUrl);
                })
            );
        } catch (error) {
            console.error('Error adding paper URLs:', error);
            throw new Error('Error adding paper URLs');
        }
    }
    return model;
}

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { deleted: true };
  }
}

module.exports = ModelsService;
