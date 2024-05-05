const express = require('express')
const router = express.Router();
const favModel = require('../controllers/list_fav_model.controller');

router
    .post('/', favModel.create)
    .get('/:id', favModel.get)
    .delete('/:id/:id2', favModel._delete);
module.exports = router;