const { models } = require('../libs/sequelize');

class NotificationsService {
  constructor() { }

  async createNotification(data) {
    const notification = await models.Notifications.create(data);
    return notification;
  }

  async getNotifications() {
    const notifications = await models.Notifications.findAll({
      order: [['not_date', 'DESC']]
    });
    return notifications;
  }

  async getNotificationsByUser(userId) {
    const notifications = await models.Notifications.findAll({
      where: { id_user: userId },
      order: [['not_date', 'DESC']]
    });
    return notifications;
  }

  async deleteNotification(notificationId) {
    const result = await models.Notifications.destroy({ where: { id: notificationId } });
    return result;
  }

  async clearNotifications(userId) {
    const result = await models.Notifications.destroy({ where: { id_user: userId } });
    return result;
  }

  async clearAllNotifications() {
    const result = await models.Notifications.destroy({ where: {} });

    return result;
  }
}

module.exports = NotificationsService;
