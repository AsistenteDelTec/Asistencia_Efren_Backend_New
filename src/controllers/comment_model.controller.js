const CommentModelService = require('../services/comment_model.services'); // Path to your service

class CommentModelController {
  // Create a new comment
  async create(req, res, next) {
    try {
      const commentData = await CommentModelService.create(req); // Pass the request object to the service
      return res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: commentData.data,
      });
    } catch (error) {
      next(error); // Pass to the error handler
    }
  }

  // Get all comments for a model
  async findByModel(req, res, next) {
    try {
      const { id_model } = req.params; // Assuming the model ID is passed as a URL parameter
      const comments = await CommentModelService.findByModel(id_model);
      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all comments made by a user
  async findByUser(req, res, next) {
    try {
      const { id_user } = req.params; // Assuming the user ID is passed as a URL parameter
      const comments = await CommentModelService.findByUser(id_user);
      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update a comment (e.g., to like/dislike)
  async update(req, res, next) {
    try {
      const { id } = req.params; // Assuming the comment ID is passed as a URL parameter
      const updatedComment = await CommentModelService.update(id, req); // Pass the request body (e.g., likes/dislikes)
      return res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment.data,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a comment
  async delete(req, res, next) {
    try {
      const { id } = req.params; // Assuming the comment ID is passed as a URL parameter
      const response = await CommentModelService.delete(id);
      return res.status(200).json({
        success: true,
        message: response.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get the total count of comments for a model
  async countCommentsForModel(req, res, next) {
    try {
      const { id_model } = req.params;
      const count = await CommentModelService.countCommentsForModel(id_model);
      return res.status(200).json({
        success: true,
        count: count.count,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get the total count of comments made by a user
  async countCommentsForUser(req, res, next) {
    try {
      const { id_user } = req.params;
      const count = await CommentModelService.countCommentsForUser(id_user);
      return res.status(200).json({
        success: true,
        count: count.count,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentModelController();
