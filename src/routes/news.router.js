const express = require('express')
const router = express.Router();
const newsController = require('../controllers/news.controller');

router
    .get('/', newsController.get)
    .get('/getAllWithUser', newsController.getAllWithUser)
    .get('/:id', newsController.getById)
    .get('/withUser/:id', newsController.getWithUser)
    .get('/newsByYear/:year', newsController.getPostsByYear)
    .post('/', newsController.create)
    .put('/:id', newsController.update)
    .delete('/:id', newsController._delete);

module.exports = router;