const { models } = require('../libs/sequelize');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')
const { Op, fn, col } = require('sequelize');
const { sendVerificationEmail, sendNewPasswordEmail } = require('../services/email.services');

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
            let token = this.generateToken(user)

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
                },
                include: [{
                    model: models.Models,
                    where: {
                        status: 'Accepted',
                        privated:'false'
                    }
                }]
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
                },
                include: [{
                    model: models.Datasets,
                    where: {
                        status: 'Accepted',
                        privated:'false'
                    }
                }]
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
                },
                include: [{
                    model: models.News,
                    where: {
                        status: 'Accepted',
                    }
                }]
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

    async getUsersByYear(year) {
        const results = await models.Users.findAll({
            attributes: [
                [fn('DATE_TRUNC', 'month', col('date_joined')), 'month'],
                [fn('COUNT', col('id')), 'count'],
            ],
            where: {
                date_joined: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`],
                },
            },
            group: [fn('DATE_TRUNC', 'month', col('date_joined'))],
            order: [[fn('DATE_TRUNC', 'month', col('date_joined')), 'ASC']],
        });

        const data = results.map(result => ({
            month: result.dataValues.month,
            count: result.dataValues.count,
        }));

        return (data)
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
            console.log("Usuario verificado: ", user)
            let token = this.generateToken(user)
            // let token = jwt.sign({ user: user }, authConfig.secret, {
            //     expiresIn: authConfig.expires
            // });
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

    generateToken(user) {
        const payload = {
            id: user.id,
            email:user.email,
            role: user.user_role
        };

        return jwt.sign(payload, authConfig.secret, { expiresIn: authConfig.expires });
    }

    async resetPassword(email) {
        try {
            const user = await this.findOneByEmail(email);
            if (!user) {
                throw new Error('No existe un usuario con este correo electrónico.');
            }

            const generateRandomPassword = () => {
                const length = 8;
                const lowercase = 'bcdfghjklmnpqrstvwxyz';
                const uppercase = 'BCDFGHJKLMNPQRSTVWXYZ';
                const numbers = '0123456789';
                const symbols = '!$%&()@#_';
                
                let password = '';
            
                password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
                password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
                password += numbers.charAt(Math.floor(Math.random() * numbers.length));
                password += symbols.charAt(Math.floor(Math.random() * symbols.length));
            
                const allChars = lowercase + uppercase + numbers + symbols;
                for (let i = password.length; i < length; ++i) {
                    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
                }
            
                return password.split('').sort(() => Math.random() - 0.5).join('');
            };

            const newPassword = generateRandomPassword();

            const hashedPassword = bcrypt.hashSync(newPassword, parseInt(authConfig.rounds));

            await user.update({ password: hashedPassword });

            await sendNewPasswordEmail(user.email, newPassword);

            return { success: true, message: 'Se ha restablecido la contraseña.' };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }

    async resetPasswordManually(email, currentPassword, newPassword) {
        try {
            const user = await this.findOneByEmail(email);
            if (!user) {
                throw { status: 404, succes: false, message: 'No existe un usuario con este correo electrónico.' };
            }

            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            console.log(passwordMatch)
            if (!passwordMatch) {
                console.log("contraseña no coincide");
                throw { status: 400, succes: false, message: 'La contraseña actual es incorrecta.' };
            }

            const hashedPassword = bcrypt.hashSync(newPassword, parseInt(authConfig.rounds));
            await user.update({ password: hashedPassword });

            return { status: 200, success: true, message: 'Se ha restablecido la contraseña.' };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
}

module.exports = UsersService;
