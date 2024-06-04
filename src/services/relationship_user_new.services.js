const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const NotificationsService = require('./notifications.services');
const notificationsService = new NotificationsService();
const { getIo } = require('../config/socket');

class RelationshipUserNews {
    constructor() { }

    async create(data) {

        const datos = {
            id_user: data.body.id_user,
            id_new: data.body.id_new,
        };

        const res = await models.RelationshipUserNew.create(datos);
        const userFound = await models.Users.findByPk(datos.id_user);
        const notification = await notificationsService.createNotification({
            id_user: datos.id_user,
            category: 'NEW',
            message: `${userFound.fullname} ha creado una nueva noticia. `,
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
        return res;
    }

    async find(id) {
        try {
            const user = await models.Users.findByPk(id, {
                include: [
                    {
                        model: models.News,
                        as: 'news' // Utiliza el alias 'models' que configuraste en la asociación
                    }
                ]
            });
            return { user };
        } catch (error) {
            console.error('Error fetching user and models:', error);
            throw error;
        }
    }

    async findOne(id, id2) {
        const res = await models.RelationshipUserNew.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_new: id2 }],
            }
        });
        return res;
    }

    async delete(id, id2) {
        const model = await this.findOne(id, id2);
        await model.destroy();
        return { deleted: true };
    }
}

module.exports = RelationshipUserNews;