const { models } = require('../libs/sequelize'); // Assuming models is correctly set up with Sequelize
const { Op } = require('sequelize');

class CommentModelService {
  // Create a comment for a specific model
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

  // Get all comments for a model
  async findByModel(id_model) {
    try {
      const comments = await models.CommentModel.findAll({
        where: {
          id_model,
        },
        include: [
          {
            model: models.Users, // Assuming you have the user model set up correctly
            as: 'user',
            attributes: ['fullname'],
          }
        ],
        order: [['id', 'ASC']], // Order by comment id or any other logic
      });
      return comments;
    } catch (error) {
      console.error("Error fetching comments by model", error.message);
      throw new Error(error.message || "Error fetching comments");
    }
  }

  // Get all comments made by a user
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
            attributes: ['model_name'], // Adjust according to the model fields you want
          }
        ],
        order: [['id', 'ASC']], // Order by comment id or any other logic
      });
      return comments;
    } catch (error) {
      console.error("Error fetching comments by user", error.message);
      throw new Error(error.message || "Error fetching user comments");
    }
  }

  // Update a comment (like or dislike)
  async update(id, data) {
    const { likes, dislikes } = data.body;

    try {
      const comment = await models.CommentModel.findByPk(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Only update likes or dislikes if they are provided
      if (likes !== undefined) comment.likes = likes;
      if (dislikes !== undefined) comment.dislikes = dislikes;

      await comment.save(); // Save the updated comment

      return { success: true, data: comment };
    } catch (error) {
      console.error("Error updating comment", error.message);
      throw new Error(error.message || "Error updating comment");
    }
  }

  // Delete a comment
  async delete(id) {
    try {
      const comment = await models.CommentModel.findByPk(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      await comment.destroy(); // Delete the comment
      return { success: true, message: 'Comment deleted successfully' };
    } catch (error) {
      console.error("Error deleting comment", error.message);
      throw new Error(error.message || "Error deleting comment");
    }
  }

  // Get the total count of comments for a model
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

  // Get the total count of comments for a user
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
