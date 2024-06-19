const express = require('express')
const router = express.Router();
const relationDataset = require('../controllers/relationship_user_dataset.controller');

router

    .get('/myDatasets/:id', relationDataset.getMyDatasets)
    .post('/', relationDataset.create)
    .get('/', relationDataset.getAll)
    .get('/:id', relationDataset.get)
    .get('/:id/:id2', relationDataset.getOne)
    .delete('/:id/:id2', relationDataset._delete);
module.exports = router;