const { models } = require('../libs/sequelize');
const { Op, fn, col, Sequelize } = require('sequelize');
const RelationshipUserModelService = require('./relationship_user_model.services');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const { getIo } = require('../config/socket');

class ModelsService {
  constructor() {
    this.listFollowUsersService = new ListFollowUsersService();
    this.relationshipUserModelService = new RelationshipUserModelService();
    this.notificationsService = new NotificationsService();
  }

  async create(data) {
    const modelData = {
      model_name: data.body.model_name,
      publish_date: data.body.publish_date,
      small_description: data.body.small_description,
      large_description: data.body.large_description,
      score: data.body.score,
      accuracy: data.body.accuracy,
      url_colab: data.body.url_colab,
      url_dataset: data.body.url_dataset,
      url_paper: data.body.url_paper,
      version: data.body.version,
      privated: data.body.privated,
      cont_views: data.body.cont_views,
      status: data.body.status
    };

    const res = await models.Models.create(modelData);
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
    try {
      const model = await this.findOne(id);
      const previousStatus = model.status;
      const updatedModel = await model.update(data);

      const modelData = {
        id: id,
        model_name: updatedModel.model_name,
        publish_date: updatedModel.publish_date,
        small_description: updatedModel.small_description,
        large_description: updatedModel.large_description,
        score: updatedModel.score,
        accuracy: updatedModel.accuracy,
        url_colab: updatedModel.url_colab,
        url_dataset: updatedModel.url_dataset,
        url_paper: updatedModel.url_paper,
        version: updatedModel.version,
        privated: updatedModel.privated,
        cont_views: updatedModel.cont_views,
        status: updatedModel.status
      };

      if (previousStatus !== 'Accepted' && updatedModel.status === 'Accepted') {
        const gUser = await this.relationshipUserModelService.findUser(updatedModel.id)
        const followers = await this.listFollowUsersService.getFollowersOfAuthor(gUser.userFound.id);


        for (const follower of followers) {
          const notification = await this.notificationsService.createNotification({
            id_user: follower,
            category: 'MODEL',
            message: `${gUser.userFound.fullname} a publicado el modelo ${updatedModel.model_name}.`,
            not_date: new Date(),
            to_admin: false
          });

          const io = getIo();
          io.emit('notification', {
            userId: notification.id_user,
            message: notification.message,
            id: notification.id,
            date: new Date(notification.not_date).toLocaleDateString(),
            time: new Date(notification.not_date).toLocaleTimeString(),
            category: notification.category,
            to_admin: false
          });
        }
      }

      return modelData;

    } catch (error) {
      console.error('Error al actualizar el modelo:', error);
      throw error;
    }
  }

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { deleted: true };
  }
}

module.exports = ModelsService;
