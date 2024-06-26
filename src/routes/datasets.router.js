const express = require('express')
const router = express.Router();
const datasetsController = require('../controllers/datasets.controller');

router
    .get('/', datasetsController.get)
    .get('/:id', datasetsController.getById)
    .get('/datasetsByYear/:year', datasetsController.getPostsByYear)
    .post('/', datasetsController.create)
    .put('/:id', datasetsController.update)
    .delete('/:id', datasetsController._delete);

module.exports = router;