const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const NotificationsService = require('./notifications.services');
const notificationsService = new NotificationsService();
const { getIo } = require('../config/socket'); // Importa getIo del módulo de socket

class ListFollowUsersService {
    constructor() { }

    async create(data) {
        const datos = {
            id_user: data.body.id_user,
            id_user_follow: data.body.id_user_follow,
            category: 'FOLLOWER',
            to_admin: false
        };

        try {
            // Crear la relación de seguimiento
            const res = await models.ListFollowUsers.create(datos);
            const user = await models.Users.findByPk(datos.id_user);
            // Crear notificación para el usuario seguido
            const notification = await notificationsService.createNotification({
                id_user: datos.id_user_follow,
                category: datos.category,
                message: `${user.fullname} ha comenzado a seguirte.`,
                not_date: new Date(),
                to_admin: false
            });

            // Emitir evento de notificación
            const io = getIo(); // Obtiene la instancia de io
            console.log('Socket.IO instance:', io); // Verificar si io está definido
            io.emit('notification', {
                id_user: datos.id_user_follow,
                message: notification.message,
                category: datos.category,
                id: notification.id,
                date: new Date(notification.not_date).toLocaleDateString(),
                time: new Date(notification.not_date).toLocaleTimeString(),
                to_admin: false
            });

            return res;
        } catch (error) {
            console.error('Error creating follow relationship or notification:', error);
            throw new Error('Error creating follow relationship or notification: ' + error.message);
        }
    }

    async find(id) {
        console.log(id);
        const relations = await models.ListFollowUsers.findAll({
            where: {
                id_user: id
            }
        });

        const relatedUsers = await Promise.all(relations.map(async (relation) => {
            const user = await models.Users.findByPk(relation.id_user_follow);
            return user;
        }));

        return relatedUsers;
    }

    async findOne(id, id2) {
        const res = await models.ListFollowUsers.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_user_follow: id2 }],
            }
        });
        return res;
    }

    async update(id, data) {
        const model = await this.findOne(id);
        const res = await model.update(data);
        return res;
    }

    async delete(id, id2) {
        const model = await this.findOne(id, id2);
        await model.destroy();
        return { deleted: true };
    }

    async getFollowersOfAuthor(authorId) {
        const followers = await models.ListFollowUsers.findAll({
            attributes: ['id_user'],
            where: {
                id_user_follow: authorId,
                id_user: {
                    [Op.ne]: authorId
                }
            },
            include: [{
                model: models.Users,
                attributes: ['id']
            }]
        });

        return followers.map(follower => follower.id_user);
    }
}

module.exports = ListFollowUsersService;
