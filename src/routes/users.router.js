const express = require('express')
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authenticateToken = require('../middleware/authenticateToken');

router
    .get('/', usersController.get)
    .get('/:id', usersController.getById)
    .get('/community/:id', usersController.getCommunity)
    .get('/count/:id', usersController.getCount)
    .get('/followers/:id', usersController.getFollowers)
    .put('/:id', authenticateToken, usersController.update)
    .get('/usersByYear/:year', usersController.getUsersByYear)
    .post('/', usersController.create)
    .delete('/:id', usersController._delete);

module.exports = router;

