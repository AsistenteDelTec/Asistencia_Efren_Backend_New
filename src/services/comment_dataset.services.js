const { models } = require('../libs/sequelize');

class CommentDatasetService {
  async create(data) {
    const { id_user, id_dataset, comment } = data;

    const commentData = {
      id_user,
      id_dataset,
      comment,
    };

    try {
      const newComment = await models.CommentDataset.create(commentData);
      return { success: true, data: newComment };
    } catch (error) {
      console.error("Error creating dataset comment", error.message);
      throw new Error(error.message || "Error creating dataset comment");
    }
  }

  async findByDataset(id_dataset) {
    try {
      const comments = await models.CommentDataset.findAll({
        where: {
          id_dataset,
        },
        include: [
          {
            model: models.Users, 
            as: 'user',
            attributes: ['fullname'],
          }
        ],
        order: [['id', 'ASC']],
      });
      return comments;
    } catch (error) {
      console.error("Error fetching comments by dataset", error.message);
      throw new Error(error.message || "Error fetching comments");
    }
  }

  async findByUser(id_user) {
    try {
      const comments = await models.CommentDataset.findAll({
        where: {
          id_user,
        },
        include: [
          {
            model: models.Datasets,
            as: 'dataset',
            attributes: ['dataset_name'], 
          }
        ],
        order: [['id', 'ASC']],
      });
      return comments;
    } catch (error) {
      console.error("Error fetching comments by user for datasets", error.message);
      throw new Error(error.message || "Error fetching user comments for datasets");
    }
  }

  async update(id, data) {
    const { likes, dislikes } = data.body;

    try {
      const comment = await models.CommentDataset.findByPk(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (likes !== undefined) comment.likes = likes;
      if (dislikes !== undefined) comment.dislikes = dislikes;

      await comment.save();

      return { success: true, data: comment };
    } catch (error) {
      console.error("Error updating dataset comment", error.message);
      throw new Error(error.message || "Error updating dataset comment");
    }
  }

  async delete(id) {
    try {
      const comment = await models.CommentDataset.findByPk(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      await comment.destroy(); 
      return { success: true, message: 'Dataset comment deleted successfully' };
    } catch (error) {
      console.error("Error deleting dataset comment", error.message);
      throw new Error(error.message || "Error deleting dataset comment");
    }
  }

  async countCommentsForDataset(id_dataset) {
    try {
      const count = await models.CommentDataset.count({
        where: {
          id_dataset,
        },
      });
      return { count };
    } catch (error) {
      console.error("Error counting dataset comments", error.message);
      throw new Error(error.message || "Error counting dataset comments");
    }
  }

  async countCommentsForUser(id_user) {
    try {
      const count = await models.CommentDataset.count({
        where: {
          id_user,
        },
      });
      return { count };
    } catch (error) {
      console.error("Error counting user comments for datasets", error.message);
      throw new Error(error.message || "Error counting user comments for datasets");
    }
  }
}

module.exports = CommentDatasetService;
