const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

router
    .post('/up', authController.signUp)
    .post('/in', authController.signIn)
    .get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    .get('/google/callback',
        passport.authenticate('google', { failureRedirect: '/login', session: false }),
        (req, res) => {
            // Aquí manejas la respuesta y rediriges al frontend con un token JWT

            console.log(req.user)
            const token = jwt.sign({ user: req.user }, authConfig.secret, { expiresIn: authConfig.expires });
            res.redirect(`http://localhost:5173/login/success?token=${token}`); // Redirige al frontend con el token
        }
    );

module.exports = router;
