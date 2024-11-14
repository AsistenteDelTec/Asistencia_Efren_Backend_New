const CommentDatasetService = require('../services/comment_dataset.services');

class CommentDatasetController {
  async create(req, res, next) {
    try {
      const commentData = await CommentDatasetService.create(req); 
      return res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: commentData.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async findByDataset(req, res, next) {
    try {
      const { id_dataset } = req.params; 
      const comments = await CommentDatasetService.findByDataset(id_dataset);
      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  async findByUser(req, res, next) {
    try {
      const { id_user } = req.params; 
      const comments = await CommentDatasetService.findByUser(id_user);
      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params; 
      const updatedComment = await CommentDatasetService.update(id, req);
      return res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: updatedComment.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params; 
      const response = await CommentDatasetService.delete(id);
      return res.status(200).json({
        success: true,
        message: response.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async countCommentsForDataset(req, res, next) {
    try {
      const { id_dataset } = req.params;
      const count = await CommentDatasetService.countCommentsForDataset(id_dataset);
      return res.status(200).json({
        success: true,
        count: count.count,
      });
    } catch (error) {
      next(error);
    }
  }

  async countCommentsForUser(req, res, next) {
    try {
      const { id_user } = req.params;
      const count = await CommentDatasetService.countCommentsForUser(id_user);
      return res.status(200).json({
        success: true,
        count: count.count,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentDatasetController();
