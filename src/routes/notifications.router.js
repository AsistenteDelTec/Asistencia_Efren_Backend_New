// routes/notifications.router.js
const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');

router.post('/', notificationsController.createNotification);
router.get('/:userId', notificationsController.getNotificationsByUser);
router.get('/', notificationsController.getNotifications);
router.delete('/:id', notificationsController.deleteNotification);
router.delete('/clear/:userId', notificationsController.clearNotifications);

module.exports = router;
