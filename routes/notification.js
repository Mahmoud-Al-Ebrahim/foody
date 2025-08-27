
const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

router.get("/", verifyTokenAndAuthorization ,  notificationController.getUserNotifications);

router.put("/mark-all-read", verifyTokenAndAuthorization ,  notificationController.markAllAsRead);

module.exports = router;