const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const NotificationsService = require('./notifications.services');
const notificationsService = new NotificationsService();
const { getIo } = require('../config/socket');
const RelationshipUserDataset = require('./relationship_user_dataset.services');
const UsersService = require('./users.services');
const usersService = new UsersService();
const relationshipUserDataset = new RelationshipUserDataset();
class ListFavDatasetsService {
    constructor() { }

    async create(data) {
        const datos = {
            id_user: data.body.id_user,
            id_dataset: data.body.id_dataset,
        };
        const res = await models.ListFavDatasets.create(datos);
        const user = await usersService.findOne(datos.id_user)
        const dts = await relationshipUserDataset.findUser(datos.id_dataset)
        const notification = await notificationsService.createNotification({
            id_user: dts.userFound.id,
            category: 'DATASET',
            message: `${user?.fullname} le ha gustado tu set de datos`,
            not_date: new Date(),
            to_admin: false // Indicar que esta notificación es para el usuario
        });

        if (!notification) {
            throw new Error('Error al crear la notificación de cambio de estado.');
        }

        // Emitir evento de notificación para el usuario
        const io = getIo();
        io.emit('notification', {
            id_user: datos.id_user,
            message: notification.message,
            id: notification.id,
            date: new Date(notification.not_date).toLocaleDateString(),
            time: new Date(notification.not_date).toLocaleTimeString(),
            category: notification.category,
            to_admin: false // Indicar que esta notificación es para el usuario
        });

        return res;
    }

    async find(id) {
        try {
            const user = await models.Users.findByPk(id, {
                include: [
                    {
                        model: models.Datasets,
                        as: 'favDatasets',
                        include:
                        {
                            model: models.Users, // Modelo de usuario para el autor
                            as: 'user', // Alias para el autor del modelo
                            attributes: ['fullname'],
                        },
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
        const res = await models.ListFavDatasets.findOne({
            where: {
                [Op.and]: [{ id_user: id }, { id_model: id2 }],
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

module.exports = ListFavDatasetsService;