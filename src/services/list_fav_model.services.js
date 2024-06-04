const { RelationshipUserModel } = require('../db/models/relationship_user_model.model');
const relationshipUserModel = new RelationshipUserModel();
const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const UsersService = require('./users.services');
const usersService = new UsersService();

class ListFavModelsService {
    constructor() { }

    async create(data) {
        const datos = {
            id_user: data.body.id_user,
            id_model: data.body.id_model,
        };
        const res = await models.ListFavModels.create(datos);
        const user = await usersService.findByPk(datos.id_user)
        const dts = await relationshipUserModel.findUser(datos.id_model)
        const notification = await notificationsService.createNotification({
            id_user: dts.userFound.id,
            category: 'MODEL',
            message: ` ${user?.fullname} le ha gustado tu modelo`,
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
                        model: models.Models,
                        as: 'favModel',
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
        const res = await models.ListFavModels.findOne({
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

module.exports = ListFavModelsService;