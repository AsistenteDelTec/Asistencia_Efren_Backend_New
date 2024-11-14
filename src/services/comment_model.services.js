const { models } = require('../libs/sequelize');

class CommentModelService {
  async create(data) {
    const { id_user, id_model, comment } = data;

    const commentData = {
      id_user,
      id_model,
      comment,
    };

    try {
      const newComment = await models.CommentModel.create(commentData);
      return { success: true, data: newComment };
    } catch (error) {
      console.error("Error creating comment", error.message);
      throw new Error(error.message || "Error creating comment");
    }
  }

  async findByModel(id_model) {
    try {
      const comments = await models.CommentModel.findAll({
        where: {
          id_model,
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
      console.error("Error fetching comments by model", error.message);
      throw new Error(error.message || "Error fetching comments");
    }
  }

  async findByUser(id_user) {
    try {
      const comments = await models.CommentModel.findAll({
        where: {
          id_user,
        },
        include: [
          {
            model: models.Models,
            as: 'model',
            attributes: ['model_name'], 
          }
        ],
        order: [['id', 'ASC']],
      });
      return comments;
    } catch (error) {
      console.error("Error fetching comments by user", error.message);
      throw new Error(error.message || "Error fetching user comments");
    }
  }

  async update(id, data) {
    const { likes, dislikes } = data.body;

    try {
      const comment = await models.CommentModel.findByPk(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      if (likes !== undefined) comment.likes = likes;
      if (dislikes !== undefined) comment.dislikes = dislikes;

      await comment.save();

      return { success: true, data: comment };
    } catch (error) {
      console.error("Error updating comment", error.message);
      throw new Error(error.message || "Error updating comment");
    }
  }

  async delete(id) {
    try {
      const comment = await models.CommentModel.findByPk(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      await comment.destroy(); 
      return { success: true, message: 'Comment deleted successfully' };
    } catch (error) {
      console.error("Error deleting comment", error.message);
      throw new Error(error.message || "Error deleting comment");
    }
  }

  async countCommentsForModel(id_model) {
    try {
      const count = await models.CommentModel.count({
        where: {
          id_model,
        },
      });
      return { count };
    } catch (error) {
      console.error("Error counting comments", error.message);
      throw new Error(error.message || "Error counting comments");
    }
  }

  async countCommentsForUser(id_user) {
    try {
      const count = await models.CommentModel.count({
        where: {
          id_user,
        },
      });
      return { count };
    } catch (error) {
      console.error("Error counting user comments", error.message);
      throw new Error(error.message || "Error counting user comments");
    }
  }
}

module.exports = CommentModelService;
