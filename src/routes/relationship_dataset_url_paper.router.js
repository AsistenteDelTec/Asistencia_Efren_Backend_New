const express = require('express');
const router = express.Router();
const { create, getOne, _delete, getAll } = require('../controllers/relationship_dataset_url_paper.controller');

router.post('/', create);
router.get('/', getAll);
router.get('/getOne/:dataset_id/:paperId', getOne);
router.delete('/:dataset_id/:paperId', _delete);

module.exports = router;
