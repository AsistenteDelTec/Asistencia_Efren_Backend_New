const express = require('express')
const router = express.Router();
const followController = require('../controllers/list_follow_users.controller');

router
    .post('/', followController.create)
    .get('/:id', followController.get);
module.exports = router;