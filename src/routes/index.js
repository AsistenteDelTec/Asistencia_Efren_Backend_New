const express = require('express');
const usersRouter = require('./users.router');
const followRouter = require('./list_follow_users.router');
const modelsRouter = require('./models.router');
const newsRouter = require('./news.router');
const datasetsRouter = require('./datasets.router');
const relationshipModel = require('./relationship_user_model.router')
const relationshipModelCategories = require('./relationship_model_category.router')
const relationshipDatasetCategories = require('./relationship_dataset_category.router')
const relationshipDataset = require('./relationship_user_dataset.router')
const relationshipNew = require('./relationship_user_new.router')
const favModel = require('./list_fav_model.router')
const favDataset = require('./list_fav_dataset.router')
const authRouter = require('./auth.router');
const ticketRouter = require('./ticket.router');
const notificationsRouter = require('./notifications.router');
const categories = require('./categories.router');
const relationshipModelUrlDataset = require('./relationship_model_url_dataset.router');
const relationshipModelUrlPaper = require('./relationship_model_url_paper.router');

function routerApi(app) {
    const router = express.Router();
    app.use('/api/v1', router);
    router.use('/users', usersRouter);
    router.use('/follow', followRouter);
    router.use('/models', modelsRouter);
    router.use('/news', newsRouter);
    router.use('/datasets', datasetsRouter);
    router.use('/relationshipModel', relationshipModel);
    router.use('/relationshipModelCategories', relationshipModelCategories);
    router.use('/relationshipDatasetCategories', relationshipDatasetCategories);
    router.use('/relationshipDataset', relationshipDataset);
    router.use('/relationshipNew', relationshipNew);
    router.use('/favModel', favModel);
    router.use('/favDataset', favDataset);
    router.use('/auth',authRouter);
    router.use('/ticket',ticketRouter);
    router.use('/notifications', notificationsRouter);
    router.use('/categories', categories);
    router.use('/relationshipModelUrlDataset', relationshipModelUrlDataset);
    router.use('/relationshipModelUrlPaper', relationshipModelUrlPaper);
}

module.exports = routerApi;
