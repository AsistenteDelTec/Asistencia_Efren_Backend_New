const express = require('express')
const router = express.Router();
const newsController = require('../controllers/news.controller');

router
    .get('/', newsController.get)
    .get('/:id', newsController.getById)
    .get('/newsByYear/:year', newsController.getPostsByYear)
    .post('/', newsController.create)
    .put('/:id', newsController.update)
    .delete('/:id', newsController._delete);

module.exports = router;