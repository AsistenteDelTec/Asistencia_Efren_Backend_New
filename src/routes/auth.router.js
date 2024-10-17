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
    .get('/verify-email', authController.verifyEmail)
    .post('/forgot-password', authController.sendOtp) 
    .post('/verify-otp', authController.verifyOtp)
    .post('/reset-password', authController.resetPassword);

module.exports = router;
