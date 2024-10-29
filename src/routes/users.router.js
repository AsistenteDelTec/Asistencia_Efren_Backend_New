const express = require('express')
const router = express.Router();
const usersController = require('../controllers/users.controller');

router
    .get('/', usersController.get)
    .get('/:id', usersController.getById)
    .get('/community/:id', usersController.getCommunity)
    .get('/count/:id', usersController.getCount)
    .get('/followers/:id', usersController.getFollowers)
    .get('/usersByYear/:year', usersController.getUsersByYear)
    .post('/', usersController.create)
    .put('/:id', usersController.update)
    .delete('/:id', usersController._delete)
    .post('/reset-password', usersController.resetPassword);

module.exports = router;

