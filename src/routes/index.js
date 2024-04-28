const express = require('express');
const usersRouter = require('./users.router');
const followRouter = require('./list_follow_users.router');

function routerApi(app){
    const router = express.Router();
    app.use('/api/v1',router);
    router.use('/users',usersRouter);
    router.use('/follow',followRouter);
}

module.exports = routerApi;
