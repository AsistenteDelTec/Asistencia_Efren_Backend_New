const express = require('express');
const usersRouter = require('./users.router');
const followRouter = require('./list_follow_users.router');
const modelsRouter = require('./models.router');
const newsRouter = require('./news.router');
const datasetsRouter = require('./datasets.router');
const relationshipModel = require('./relationship_user_model.router')
const relationshipDataset = require('./relationship_user_dataset.router')
const relationshipNew = require('./relationship_user_new.router')

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/users', usersRouter);
    router.use('/follow', followRouter);
    router.use('/models', modelsRouter);
    router.use('/news', newsRouter);
    router.use('/datasets', datasetsRouter);
    router.use('/relationshipModel', relationshipModel);
    router.use('/relationshipDataset', relationshipDataset);
    router.use('/relationshipNew', relationshipNew);
}

module.exports = routerApi;
