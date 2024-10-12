const express = require('express');
const router = express.Router();
const { create, getOne, _delete, getAll } = require('../controllers/relationship_model_url_dataset.controller');

router.post('/', create);
router.get('/', getAll);
router.get('/getOne/:model_id/:datasetId', getOne);
router.delete('/:model_id/:datasetId', _delete);

module.exports = router;
