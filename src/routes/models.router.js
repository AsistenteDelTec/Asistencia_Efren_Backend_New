const express = require('express')
const router = express.Router();
const modelsController = require('../controllers/models.controller');

//Router de modelos
router
    .get('/topModels/', modelsController.getTopModels)
    .get('/', modelsController.get)
    .get('/:id', modelsController.getById)
    .get('/withUser/:id', modelsController.getByIdWithUser)
    .get('/modelsByYear/:year', modelsController.getPostsByYear)
    .post('/', modelsController.create)
    .put('/:id', modelsController.update)
    .delete('/:id', modelsController._delete);

module.exports = router;