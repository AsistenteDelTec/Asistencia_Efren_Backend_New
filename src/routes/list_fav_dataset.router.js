const express = require('express')
const router = express.Router();
const favDataset = require('../controllers/list_fav_datsets.controller');

router
    .post('/', favDataset.create)
    .get('/:id', favDataset.get)
    .delete('/:id/:id2', favDataset._delete);
module.exports = router;