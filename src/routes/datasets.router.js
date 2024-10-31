const express = require('express')
const router = express.Router();
const datasetsController = require('../controllers/datasets.controller');

router
    .get('/topDatasetsByCategory/', datasetsController.getTopDatasetsByCategory)
    .get('/topDatasetsByViews/', datasetsController.getTopDatasetsByViews)
    .get('/GetWithPagination', datasetsController.getWithPagination)
    .get('/', datasetsController.get)
    .get('/:id', datasetsController.getById)
    .get('/datasetsByYear/:year', datasetsController.getPostsByYear)
    .post('/', datasetsController.create)
    .put('/:id', datasetsController.update)
    .delete('/:id', datasetsController._delete);

module.exports = router;