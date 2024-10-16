const express = require('express');
const router = express.Router();
const { create, getOne, _delete, getAll } = require('../controllers/relationship_model_url_paper.controller');

router.post('/', create);
router.get('/', getAll);
router.get('/getOne/:model_id/:paperId', getOne);
router.delete('/:model_id/:paperId', _delete);

module.exports = router;
