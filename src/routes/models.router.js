const express = require('express')
const router = express.Router();
const modelsController = require('../controllers/models.controller');

router
    .get('/', modelsController.get)
    .get('/:id', modelsController.getById)
    .post('/', modelsController.create)
    .put('/:id', modelsController.update)
    .delete('/:id', modelsController._delete);

module.exports = router;