const express = require('express')
const router = express.Router();
const modelsController = require('../controllers/models.controller');

router

    .get('/topModels/', modelsController.getTopModels)
    .get('/', modelsController.get)
    .get('/', modelsController.getTopModels)
    .get('/:id', modelsController.getById)
    .get('/modelsByYear/:year', modelsController.getPostsByYear)
    .post('/', modelsController.create)
    .put('/:id', modelsController.update)
    .delete('/:id', modelsController._delete);

module.exports = router;