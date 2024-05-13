const express = require('express')
const router = express.Router();
const relationModel = require('../controllers/relationship_user_model.controller');

router
    .post('/', relationModel.create)
    .get('/:id', relationModel.get)
    .get('/obtenerUno/:id/:id2', relationModel.getOne)
    .get('/contar/:id', relationModel.getCount)
    .delete('/:id/:id2', relationModel._delete);
module.exports = router;