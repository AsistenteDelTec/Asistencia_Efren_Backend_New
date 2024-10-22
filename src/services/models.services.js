const { models } = require('../libs/sequelize');
const { Op, fn, col } = require('sequelize');
const RelationshipUserModelService = require('./relationship_user_model.services');
const ListFollowUsersService = require('./list_follow_users.services');
const NotificationsService = require('./notifications.services');
const RelationshipModelUrlDatasetService = require('./relationship_model_url_dataset.services'); 
const RelationshipModelUrlPaperService = require('./relationship_model_url_paper.services'); 
const RelationshipModelCategoryService = require('./relationship_model_category.services')  

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

  async find() {
    const res = await models.Models.findAll({
      order: [['id', 'ASC']]
    });
    return res;
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

    // Additional fields that can be updated by an user
    const userFields = {
      model_name: data.model_name,
      small_description: data.small_description,
      large_description: data.large_description,
      accuracy: data.accuracy,
      url_colab: data.url_colab,
      version: data.version,
      privated: data.privated, 
      cont_views: data.cont_views,
    };

    // Additional fields that can be updated by an admin
    const adminFields = {
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

    // Check and update url_datasets
    if (data.url_datasets && data.url_datasets.length > 0) {
      await this.datasetUrlService.deleteUrlsByModelId(model.id);
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

    // Check and update url_papers
    if (data.url_papers && data.url_papers.length > 0) {
        await this.paperUrlService.deleteUrlsByModelId(model.id);
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

    // Check and update categories
    if (data.categories && data.categories.length > 0) {
        await this.relationshipModelCategory.deleteByModelID(model.id);
        try {
            await Promise.all(
                data.categories.map(async (categoryId) => {
                  await this.relationshipModelCategory.create({
                    body: {
                        id_model: model.id,
                        id_category: categoryId,
                    }
                });
                })
            );
        } catch (error) {
            console.error('Error adding categories:', error);
            throw new Error('Error adding categories');
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
