const UsersService = require('../services/users.services')
const service = new UsersService();

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await service.findOneByEmail(email);
        if (!response) {
            return res.status(404).json({ msg: "Usuario con este correo no encontrado" });
        } else {
            const user = {
                id:response.id,
                username: response.username,
                fullname: response.fullname,
                password: response.password,
                email: response.email,
                date_joined: response.date_joined,
                verified: response.verified,
                user_role: response.user_role
            };
            if (bcrypt.compareSync(password, user.password)) {
                let token = jwt.sign({ user: user }, authConfig.secret, {
                    expiresIn: authConfig.expires
                });
                return res.json({
                    user: user,
                    token: token
                });
            } else {
                return res.status(401).json({
                    msg: "Contraseña incorrecta."
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const signUp = async (req, res) => {
    try{
        const response = await service.create(req);
        res.json({
            user:response.user,
            token: response.token
        })
    }catch (error){
        res.status(500).send({success: false, message: error.message});
    }
}

module.exports = {
    signIn, signUp
};