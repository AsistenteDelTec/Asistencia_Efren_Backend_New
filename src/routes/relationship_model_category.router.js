const express = require('express');
const router = express.Router();
const { create, getOne, _delete, getAll, getMyCategories } = require('../controllers/relationship_model_category.controller');

router.get('/myCategories/:id', getMyCategories);
router.post('/', create);
router.get('/', getAll); 
// router.get('/:id', get);
router.get('/getOne/:id/:id2', getOne);
router.delete('/:id/:id2', _delete);

module.exports = router;
