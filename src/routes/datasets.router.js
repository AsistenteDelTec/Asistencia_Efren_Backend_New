const express = require('express')
const router = express.Router();
const datasetsController = require('../controllers/datasets.controller');

router
    .get('/topDatasets/', datasetsController.getTopDatasets)
    .get('/topDatasetsByViews/', datasetsController.getTopDatasetsByViews)
    .get('/topDatasetsByCategory/', datasetsController.getTopDatasetsByCategory)
    .get('/groupedCategory', datasetsController.getGroupedCategory)
    .get('/GetWithPagination', datasetsController.getWithPagination)
    .get('/', datasetsController.get)
    .get('/:id', datasetsController.getById)
    .get('/withUser/:id', datasetsController.getByIdWithUser)
    .get('/datasetsByYear/:year', datasetsController.getPostsByYear)
    .post('/', datasetsController.create)
    .put('/:id', datasetsController.update)
    .delete('/:id', datasetsController._delete);

module.exports = router;