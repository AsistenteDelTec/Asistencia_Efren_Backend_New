const UsersService = require('../services/users.services');
const service = new UsersService();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Serializar y deserializar usuario
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await service.findOne(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Configurar Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/v1/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await service.findOneByEmail(profile.emails[0].value);
            if (!user) {
                // Si el usuario no existe, crearlo
                user = await service.create({
                    body: {
                        username: profile.displayName,
                        fullname: profile.displayName,
                        email: profile.emails[0].value,
                        password: bcrypt.hashSync(profile.id, parseInt(authConfig.rounds)), // Hashear una contraseña genérica
                        date_joined: new Date(),
                        verified: true,
                        user_role: 'USER'
                    }
                });
            }
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
));

module.exports = {
    signIn: async (req, res) => {
        try {
            const { email, password } = req.body;
            const response = await service.findOneByEmail(email);
            if (!response) {
                return res.status(404).json({ msg: "Usuario con este correo no encontrado" });
            } else {
                const user = {
                    id: response.id,
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
    },

    signInWithGoogle: async (req, res) => {
        passport.authenticate('google', { scope: ['profile', 'email'] });
    },

    signUp: async (req, res) => {
        try {
            const response = await service.create(req);
            res.json({
                user: response.user,
                token: response.token
            });
        } catch (error) {
            res.status(500).send({ success: false, message: error.message });
        }
    },

    googleCallback: async (req, res) => {
        console.log("Pedrio pedrio pedrio")
        // Suponiendo que después de autenticarse correctamente, redirigimos a la página principal
        const token = jwt.sign({ user: req.user }, authConfig.secret, { expiresIn: authConfig.expires });
        res.json({ token: token, user: req.user });
    }
};
