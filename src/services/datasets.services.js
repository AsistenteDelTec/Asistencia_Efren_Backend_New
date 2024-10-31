const { models } = require('../libs/sequelize');
const { Op, fn, col,  Sequelize} = require('sequelize');
const RelationshipUserDataset = require('./relationship_user_datset.service');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const { getIo } = require('../config/socket');
const { nextTick } = require('process');

class DatasetsService {
    constructor() {
        this.listFollowUsersService = new ListFollowUsersService();
        this.relationshipUserDataset = new RelationshipUserDataset();
        this.notificationsService = new NotificationsService();
    }

    async create(data) {
        const datasetData = {
            dataset_name: data.body.dataset_name,
            publish_date: data.body.publish_date,
            description: data.body.description,
            score: data.body.score,
            url_source: data.body.url_source,
            url_paper: data.body.url_paper,
            version: data.body.version,
            privated: data.body.privated,
            cont_views: data.body.cont_views,
            status: data.body.status
        };

        const res = await models.Datasets.create(datasetData);
        return res;
    }

  async findWithPagination({ page = 1, limit = 12, search = '', category, status='Accepted', privated=false }) {
        try {
          console.log("Categoria recibida: ", category)
          const offset = (page - 1) * limit;
    
          // Condiciones del where principal
          const whereConditions = {
            [Op.and]: [
              { dataset_name: { [Op.iLike]: `%${search}%`} }, // Filtrar por nombre del modelo
              { status },                      // Solo modelos con status 'Accepted'
              { privated }                          // Solo modelos que no sean privados
            ]
          };
    
          // Si hay un category, agregarlo a las condiciones del where
          if (category) {
            whereConditions[Op.and].push(
              Sequelize.literal(`EXISTS (SELECT 1 FROM "relationship_dataset_category" AS "RelationshipDatasetCategory" WHERE "RelationshipDatasetCategory"."id_dataset" = "Datasets"."id" AND "RelationshipDatasetCategory"."id_category" = ${category})`)
            );
          }
      
          const res = await models.Datasets.findAndCountAll({
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
          
          return {
            totalItems: res.count,
            totalPages: Math.ceil(res.count / limit),
            currentPage: page,
            datasets: res.rows,  // Modelos devueltos
          };
        } catch (error) {
          console.error('Error fetching data with pagination:', error);
          throw error;
        }
  }
      
  async findAll() {
    try {
        const result = await models.Datasets.findAll();
        return result;
    } catch (error) {
        console.error('Error fetching all relationships:', error);
        throw new Error('Failed to retrieve data');
    }
  }
   
  async getTopDatasetsByCategory() {
    try {
      // First, find all categories
      const categories = await models.Categories.findAll({
        where: {
            visible: true,
        }
    });
  
      // For each category, fetch the top 3 models based on cont_views
      const topDatasetsByCategory = await Promise.all(categories.map(async (category) => {
        const topDatasets = await models.Datasets.findAll({
          attributes: ['id', 'dataset_name', 'cont_views'],
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
          datasets:topDatasets,
        };

      }));
      const justCategoriesWithInfo = topDatasetsByCategory.filter((e)=> e.datasets.length > 0);
      return justCategoriesWithInfo
    } catch (error) {
      console.error('Error fetching top models:', error);
      throw error;
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

    
  async getTopViewedDatasets() {
    const topDatasets = await models.Datasets.findAll({
      attributes: ['id', 'dataset_name', 'cont_views', 'publish_date'],
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
    return topDatasets;
  }

    async update(id, data) {
        try {
            const dataset = await this.findOne(id);
            const previousStatus = dataset.status;
            const updateDataset = await dataset.update(data);

            const datasetData = {
                id: id,
                dataset_name: updateDataset.dataset_name,
                publish_date: updateDataset.publish_date,
                description: updateDataset.description,
                score: updateDataset.score,
                url_source: updateDataset.url_source,
                url_paper: updateDataset.url_paper,
                version: updateDataset.version,
                privated: updateDataset.privated,
                cont_views: updateDataset.cont_views,
                status: updateDataset.status
            };

            if (previousStatus !== 'Accepted' && updateDataset.status === 'Accepted') {
                const gUser = await this.relationshipUserDataset.findUser(updateDataset.id)
                const followers = await this.listFollowUsersService.getFollowersOfAuthor(gUser.userFound.id);


                for (const follower of followers) {
                    const notification = await this.notificationsService.createNotification({
                        id_user: follower,
                        category: 'DATASET',
                        message: `${gUser.userFound.fullname} a publicado el set de datos ${updateDataset.dataset_name}.`,
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

            return datasetData

        } catch (error) {
            console.error('Error al actualizar el modelo:', error);
            throw error;
        }
    }

    async delete(id) {
        const dataset = await this.findOne(id);
        await dataset.destroy();
        return { deleted: true };
    }
}

module.exports = DatasetsService;
