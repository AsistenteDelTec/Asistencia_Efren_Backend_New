const express = require('express');
const router = express.Router();
const { create, get, getOne, _delete, getAll, getMyModels } = require('../controllers/relationship_user_model.controller');

router.get('/myModels/:id', getMyModels);
router.post('/', create);
router.get('/', getAll); 
router.get('/:id', get);
router.get('/getOne/:id/:id2', getOne);
router.delete('/:id/:id2', _delete);

module.exports = router;
