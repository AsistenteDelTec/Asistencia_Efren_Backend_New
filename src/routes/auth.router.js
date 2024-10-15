const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const UsersService = require('../services/users.services'); 
const service = new UsersService();

router
    .post('/up', authController.signUp)
    .post('/in', authController.signIn)
    .get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
    .get('/google/callback',
        passport.authenticate('google', { failureRedirect: '/login', session: false }),
        (req, res) => {
            const token = jwt.sign({ user: req.user }, authConfig.secret, { expiresIn: authConfig.expires });
            res.redirect(`http://localhost:5173/login/success?token=${token}`);
        }
    )
    .get('/verify-email', async (req, res) => {
        const token = req.query.token;
    
        try {
            const decoded = jwt.verify(token, authConfig.secret);
            const user = await service.findOneByEmail(decoded.email);
    
            if (user) {
                await service.update(user.id, { verified: true });
                console.log('Email verificado exitosamente');
                res.send(
                    `
                    <html>
                        <body>
                            <h1>Verificación de Correo Electrónico Completada</h1>
                            <p>Estimado(a) ${user.fullname},</p>
                            <p>Nos complace informarte que tu dirección de correo electrónico ha sido verificada exitosamente.</p>
                            <p>Ahora puedes acceder a tu cuenta y disfrutar de todos los beneficios de nuestra plataforma.</p>
                            <p>Gracias por registrarte y bienvenido(a) a nuestra comunidad.</p>
                            <p>Atentamente,</p>
                            <p>El equipo de soporte.</p>
                            <p>Ya puedes cerrar esta pestaña.</p>
                        </body>
                    </html>
                    `
                );
            } else {
                console.log('Usuario no encontrado');
                res.send(
                    `
                    <html>
                        <body>
                            <h1>Verificación de Correo Electrónico Fallida</h1>
                            <p>No se encontró el usuario en la base de datos.</p>
                            <p>Por favor, solicite un nuevo enlace de verificación o comuníquese con el equipo de soporte.</p>
                        </body>
                    </html>
                    `
                );
            }
        } catch (error) {
            console.error('Error al verificar el token:', error);
            res.send(
                `
                <html>
                    <body>
                        <h1>Verificación de Correo Electrónico Fallida</h1>
                        <p>El enlace de verificación es inválido o ha expirado.</p>
                        <p>Por favor, solicite un nuevo enlace de verificación o comuníquese con el equipo de soporte.</p>
                    </body>
                </html>
                `
            );
        }
    })
    .post('/forgot-password', authController.sendOtp) 
    .post('/verify-otp', authController.verifyOtp)
    .post('/reset-password', async (req, res) => { 
      const { email } = req.body;

      try {
          const result = await service.resetPassword(email);

          if (result) {
            res.status(200).json({ success: true, message: 'Se ha restablecido la contraseña.' });
        } else {
            res.status(400).json({ success: false, message: 'Hubo un error al restablecer la contraseña.' });
        }
      } catch (error) {
          console.error('Error during password reset:', error);
          res.status(500).json({ message: 'Internal server error' });
      }
  });

module.exports = router;
