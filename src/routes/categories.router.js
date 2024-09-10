const express = require('express')
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');

router
    .get('/', categoriesController.getAll)
    .get('/visibleCategories', categoriesController.getVisible)
    .get('/:id', categoriesController.getOne)
    .post('/', categoriesController.create)
    .put('/:id', categoriesController.update)
    .delete('/:id', categoriesController._delete);

module.exports = router;