const express = require('express')
const router = express.Router();
const authController = require('../controllers/auth.controller');

router
    .post('/up', authController.signUp)
    .post('/in', authController.signIn)

module.exports = router;