const { models } = require('../libs/sequelize');
const { Op, fn, col } = require('sequelize');

class ModelsService {
  constructor() { }

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

  async find() {
    const res = await models.Models.findAll({
      order: [['id', 'ASC']] // Ordena por 'id' en orden ascendente
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

    return (data)
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
      const updateModel = await model.update(data);

      const modelData = {
        id: id,
        model_name: updateModel.model_name,
        publish_date: updateModel.publish_date,
        small_description: updateModel.small_description,
        large_description: updateModel.large_description,
        score: updateModel.score,
        accuracy: updateModel.accuracy,
        url_colab: updateModel.url_colab,
        url_dataset: updateModel.url_dataset,
        url_paper: updateModel.url_paper,
        version: updateModel.version,
        privated: updateModel.privated,
        cont_views: updateModel.cont_views,
        status: updateModel.status
      };

      return modelData

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