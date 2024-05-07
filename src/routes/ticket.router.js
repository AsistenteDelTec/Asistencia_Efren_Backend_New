const express = require('express')
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');

router
    .get('/', ticketController.get)
    .get('/:id', ticketController.getById)
    .post('/', ticketController.create)
    .put('/:id', ticketController.update)
    .delete('/:id', ticketController._delete);

module.exports = router;