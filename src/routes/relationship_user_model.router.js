const express = require('express');
const router = express.Router();
const { create, get, getOne, _delete, getAll } = require('../controllers/relationship_user_model.controller');

router.post('/', create);
router.get('/', getAll);  // Nueva ruta para obtener todos los registros
router.get('/:id', get);
router.get('/getOne/:id/:id2', getOne);
router.delete('/:id/:id2', _delete);

module.exports = router;
