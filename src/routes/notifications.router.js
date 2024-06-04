// routes/notifications.router.js
const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, notificationsController.createNotification);
router.get('/:userId', authenticateToken, notificationsController.getNotificationsByUser);
router.get('/',  notificationsController.getNotifications);
router.delete('/:id', authenticateToken,notificationsController.deleteNotification);
router.delete('/clear/:userId', authenticateToken,notificationsController.clearNotifications);
router.delete('/clearAll', notificationsController.clearAllNotifications);

module.exports = router;
