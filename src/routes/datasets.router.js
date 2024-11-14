const express = require('express')
const router = express.Router();
const datasetsController = require('../controllers/datasets.controller');

router
    .get('/topDatasets/', datasetsController.getTopDatasets)
    .get('/topDatasetsByViews/', datasetsController.getTopDatasetsByViews)
    .get('/topDatasetsByCategory/', datasetsController.getTopDatasetsByCategory)
    .get('/groupedCategory', datasetsController.getGroupedCategory)
    .get('/GetWithPagination', datasetsController.getWithPagination)
    .get('/getByStatus', datasetsController.getByStatus)
    .get('/', datasetsController.get)
    .get('/:id', datasetsController.getById)
    .get('/comments/:id', datasetsController.getComments)
    .get('/withUser/:id', datasetsController.getByIdWithUser)
    .get('/datasetsByYear/:year', datasetsController.getPostsByYear)
    .post('/', datasetsController.create)
    .post('/comments/:id', datasetsController.createComment)
    .put('/:id', datasetsController.update)
    .delete('/:id', datasetsController._delete)
    .delete('/comments/:id', datasetsController.deleteComment)

module.exports = router;