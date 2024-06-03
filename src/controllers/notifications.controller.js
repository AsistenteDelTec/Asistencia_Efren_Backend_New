// controllers/notifications.controller.js
const NotificationsService = require('../services/notifications.services');
const service = new NotificationsService();

const createNotification = async (req, res, next) => {
  try {
    const data = req.body;
    const notification = await service.createNotification(data);
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const getNotificationsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const notifications = await service.getNotificationsByUser(userId);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await service.getNotifications();
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.deleteNotification(id);
    res.status(204).json(result);
  } catch (error) {
    next(error);
  }
};

const clearNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await service.clearNotifications(userId);
    res.status(204).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationsByUser,
  deleteNotification,
  clearNotifications
};
