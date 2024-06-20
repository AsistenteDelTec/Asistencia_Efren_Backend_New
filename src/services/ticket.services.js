const { models } = require('../libs/sequelize');
const NotificationsService = require('./notifications.services');
const notificationsService = new NotificationsService();
const { getIo } = require('../config/socket');

class TicketService {
  constructor() { }

  async create(data) {
    try {
      const ticket = await models.Ticket.create(data);
      const userFound = await models.Users.findByPk(data.id_user);
      // Crear notificación para los administradores
      const notification = await notificationsService.createNotification({
        id_user: data.id_user,
        category: 'TICKET',
        message: `${userFound.fullname} ha realizado reporte.`,
        not_date: new Date(),
        to_admin: true // Indicar que esta notificación es para administradores
      });

      if (!notification) {
        throw new Error('Error al crear la notificación para los administradores.');
      }

      // Emitir evento de notificación
      const io = getIo();
      io.emit('notification', {
        userId: notification.id_user, // Emitir notificación para todos los administradores
        message: notification.message,
        id: notification.id,
        date: new Date(notification.not_date).toLocaleDateString(),
        time: new Date(notification.not_date).toLocaleTimeString(),
        category: notification.category,
        to_admin: true // Indicar que esta notificación es para administradores
      });

      return ticket;
    } catch (error) {
      throw error;
    }
  }

  async find() {
    const res = await models.Ticket.findAll();
    return res;
  }

  async findOne(id) {
    const res = await models.Ticket.findByPk(id);
    return res;
  }

  async update(id, data) {
    try {
      const model = await this.findOne(id);
      const oldStatus = model.status;
      const res = await model.update(data);

      // Crear notificación cuando el estado cambia
      if (data.status && data.status !== oldStatus) {
        const user = await models.Users.findByPk(model.id_user);
        const justificationMessage = data.justification ? (`A continuación la justificación: ${data.justification}`) : 'No se proporcionó justificación.';

        const notification = await notificationsService.createNotification({
          id_user: model.id_user,
          category: 'TICKET',
          message: `El estado de tu reporte ("${model.title}") ${(data.status == 'Pending' ? 'está pendiente' : (data.status == 'Accepted' ? 'ha sido aceptado' : 'ha sido rechazado'))}. ${justificationMessage}`,
          not_date: new Date(),
          to_admin: false // Indicar que esta notificación es para el usuario
        });

        if (!notification) {
          throw new Error('Error al crear la notificación de cambio de estado.');
        }

        // Emitir evento de notificación para el usuario
        const io = getIo();
        io.emit('notification', {
          id_user: model.id_user,
          message: notification.message,
          id: notification.id,
          date: new Date(notification.not_date).toLocaleDateString(),
          time: new Date(notification.not_date).toLocaleTimeString(),
          category: notification.category,
          to_admin: false // Indicar que esta notificación es para el usuario
        });
      }

      return res;
    } catch (error) {
      console.error('Error updating ticket or sending notification:', error);
      throw new Error('Error updating ticket or sending notification: ' + error.message);
    }
  }

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { deleted: true };
  }
}

module.exports = TicketService;
