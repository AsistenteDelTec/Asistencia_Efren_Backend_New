const express = require('express')
const router = express.Router();
const modelsController = require('../controllers/models.controller');

router
    .get('/topModels/', modelsController.getTopModels)
    .get('/topModelsByViews/', modelsController.getTopModelsByViews)
    .get('/topModelsByCategory/', modelsController.getTopModelsByCategory)
    .get('/groupedCategory', modelsController.getGroupedCategory)
    .get('/GetWithPagination', modelsController.getWithPagination)
    .get('/getByStatus', modelsController.getByStatus)
    .get('/', modelsController.get)
    .get('/:id', modelsController.getById)
    .get('/comments/:id', modelsController.getComments)
    .get('/withUser/:id', modelsController.getByIdWithUser)
    .get('/modelsByYear/:year', modelsController.getPostsByYear)
    .post('/', modelsController.create)
    .post('/comments/:id', modelsController.createComment)
    .put('/:id', modelsController.update)
    .delete('/:id', modelsController._delete)
    .delete('/comments/:id', modelsController.deleteComment)

module.exports = router;