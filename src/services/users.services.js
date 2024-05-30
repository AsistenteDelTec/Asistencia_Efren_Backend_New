const { models } = require('../libs/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const { Op } = require('sequelize');
const { sendVerificationEmail } = require('../services/email.services'); // Importar el servicio de email

class UsersService {
    constructor() { }

    async create(data) {
        try {
            let password = bcrypt.hashSync(data.body.password, parseInt(authConfig.rounds));
            const user = {
                username: data.body.username,
                fullname: data.body.fullname,
                password: password,
                email: data.body.email,
                date_joined: data.body.date_joined,
                verified: false, // Cambiar a falso por defecto
                user_role: data.body.user_role
            };

            const createdUser = await models.Users.create(user);

            // Crear token de verificación
            let token = jwt.sign({ email: user.email }, authConfig.secret, {
                expiresIn: '1h' // Expira en 1 hora
            });

            // Enviar email de verificación
            sendVerificationEmail(user.email, token);

            // Devolver los datos relevantes como un objeto
            return {
                user: createdUser,
                token: token
            };
        } catch (error) {
            // Manejar cualquier error y lanzarlo
            throw error;
        }
    }


    async find() {
        const res = await models.Users.findAll();
        return res;
    }

    async findOne(id) {
        const res = await models.Users.findByPk(id);
        console.log(res)
        return res;
    }

    async findOneByEmail(email) {
        const res = await models.Users.findOne({ where: { email: email } });
        return res;
    }

    async findComunity(iduser) {
        const res = await models.Users.findAll({
            where: {
                id: {
                    [Op.ne]: iduser
                }
            }
        });
        return res;
    }

    async countUserModels(idUser) {
        try {
            const count = await models.RelationshipUserModel.count({
                where: {
                    id_user: idUser
                }
            });
            return count;
        } catch (error) {
            console.error('Error al contar relaciones:', error);
            return null;
        }
    }

    async countUserDatasets(idUser) {
        try {
            const count = await models.RelationshipUserDataset.count({
                where: {
                    id_user: idUser
                }
            });
            return count;
        } catch (error) {
            console.error('Error al contar relaciones:', error);
            return null;
        }
    }

    async countUserNews(idUser) {
        try {
            const count = await models.RelationshipUserNew.count({
                where: {
                    id_user: idUser
                }
            });
            return count;
        } catch (error) {
            console.error('Error al contar relaciones:', error);
            return null;
        }
    }

    async countFollowers(idUser) {
        try {
            const count = await models.ListFollowUsers.count({
                where: {
                    id_user_follow: idUser
                }
            });
            return count;
        } catch (error) {
            console.error('Error al contar relaciones:', error);
            return null;
        }
    }

    async update(id, data) {
        try {
            const model = await this.findOne(id);
            const updatedModel = await model.update(data);

            const user = {
                id: id,
                username: updatedModel.username,
                fullname: updatedModel.fullname,
                password: updatedModel.password,
                email: updatedModel.email,
                date_joined: updatedModel.date_joined,
                verified: updatedModel.verified,
                user_role: updatedModel.user_role
            };

            let token = jwt.sign({ user: user }, authConfig.secret, {
                expiresIn: authConfig.expires
            });
            // let token = data.token;
            // Devolver los datos relevantes como un objeto
            return {
                user: user,
                token: token
            };
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    }

    async delete(id) {
        const model = await this.findOne(id);
        await model.destroy();
        return { deleted: true };
    }
}

module.exports = UsersService;
