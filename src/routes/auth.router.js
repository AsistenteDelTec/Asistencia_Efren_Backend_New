const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const UsersService = require('../services/users.services'); // Importa el servicio de usuarios
const service = new UsersService();

router
    .post('/up', authController.signUp)
    .post('/in', authController.signIn)
    .get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    .get('/google/callback',
        passport.authenticate('google', { failureRedirect: '/login', session: false }),
        (req, res) => {
            const token = jwt.sign({ user: req.user }, authConfig.secret, { expiresIn: authConfig.expires });
            res.redirect(`http://localhost:5173/login/success?token=${token}`); // Redirige al frontend con el token
        }
    )
    .get('/verify-email', async (req, res) => {
        const token = req.query.token;
      
        try {
          const decoded = jwt.verify(token, authConfig.secret);
          const user = await service.findOneByEmail(decoded.email);
      
          if (user) {
            await service.update(user.id, { verified: true });
            res.send('Email verificado exitosamente');
          } else {
            res.send('Usuario no encontrado');
          }
        } catch (error) {
          console.error('Error al verificar el token:', error); // Agregar log de error
          res.send('El enlace de verificación es inválido o ha expirado');
        }
      });
      

module.exports = router;
