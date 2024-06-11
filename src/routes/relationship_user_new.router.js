const express = require('express')
const router = express.Router();
const relationNews = require('../controllers/relationship_user_news.controller');

router
    .post('/', relationNews.create)
    .get('/', relationNews.getAll)
    .get('/:id', relationNews.get)
    .get('/:id/:id2', relationNews.getOne)
    .delete('/:id/:id2', relationNews._delete);
module.exports = router;