const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const NotificationsService = require('./notifications.services');
const notificationsService = new NotificationsService();
const { getIo } = require('../config/socket');

class RelationshipUserDataset {
    constructor() { }

    async create(data) {

        const datos = {
            id_user: data.body.id_user,
            id_dataset: data.body.id_dataset,
        };

        const res = await models.RelationshipUserDataset.create(datos);
        const userFound = await models.Users.findByPk(datos.id_user);

        const notification = await notificationsService.createNotification({
            id_user: datos.id_user,
            category: 'DATASET',
            message: `${userFound.fullname} ha creado un nuevo dataset. `,
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
                        model: models.Datasets,
                        as: 'datasets',
                        where: {
                            status: 'Accepted',
                            privated: 'false'
                        }
                    }
                ]
            });
            console.log(user)
            return { user };
        } catch (error) {
            console.error('Error fetching user and models:', error);
            throw error;
        }
    }

    async findMyDatasets(id) {
        try {
            const user = await models.Users.findByPk(id, {
                include: [
                    {
                        model: models.Datasets,
                        as: 'datasets',
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
        const res = await models.RelationshipUserDataset.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_dataset: id2 }],
            }
        });
        return res;
    }

    async findUser(id) {
        try {
            const user = await models.Datasets.findByPk(id, {
                include:
                {
                    model: models.Users,
                    as: 'user' // Utiliza el alias 'models' que configuraste en la asociación
                }

            });

            let userFound = user.user[0].dataValues
            return { userFound };
        } catch (error) {
            console.error('Error fetching user and models:', error);
            throw error;
        }
    }

    async delete(id, id2) {
        const model = await this.findOne(id, id2);
        await model.destroy();
        return { deleted: true };
    }

    async findAll() {
        try {
            const result = await models.RelationshipUserDataset.findAll();
            return result;
        } catch (error) {
            console.error('Error fetching all relationships:', error);
            throw new Error('Failed to retrieve data');
        }
    }
}

module.exports = RelationshipUserDataset;