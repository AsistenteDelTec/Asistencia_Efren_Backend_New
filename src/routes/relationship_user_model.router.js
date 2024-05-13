const express = require('express')
const router = express.Router();
const relationModel = require('../controllers/relationship_user_model.controller');

router
    .post('/', relationModel.create)
    .get('/:id', relationModel.get)
    .get('/getOne/:id/:id2', relationModel.getOne)
    .delete('/:id/:id2', relationModel._delete);
module.exports = router;