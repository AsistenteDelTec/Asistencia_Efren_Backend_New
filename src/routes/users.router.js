const express = require('express')
const router = express.Router();
const usersController = require('../controllers/users.controller');

router
    .get('/', usersController.get)
    .get('/:id', usersController.getById)
    .get('/community/:id', usersController.getCommunity)
    .post('/', usersController.create)
    .get('/count/:id', usersController.getCount)
    .get('/followers/:id', usersController.getFollowers)
    .put('/:id', usersController.update)
    .delete('/:id', usersController._delete);

module.exports = router;