const express = require('express');
const usersRouter = require('./users.router');
const followRouter = require('./list_follow_users.router');
const modelsRouter = require('./models.router');
const newsRouter = require('./news.router');
const datasetsRouter = require('./datasets.router');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/users', usersRouter);
    router.use('/follow', followRouter);
    router.use('/models', modelsRouter);
    router.use('/news', newsRouter);
    router.use('/datasets', datasetsRouter);
}

module.exports = routerApi;
