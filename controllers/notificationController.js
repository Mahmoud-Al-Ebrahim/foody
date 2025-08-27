

const Notification = require('../models/Notification');

module.exports = {
    getUserNotifications : async (req, res) => {
        try {
            const userId = req.user.id; // from auth middleware
            const notifications = await Notification.find({ userId })
                .sort({ createdAt: -1 });
    
            res.status(200).json({ success: true, notifications });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get notifications',
                error: error.message
            });
        }
    },

    markAllAsRead  : async (req, res) => {
        try {
            const userId = req.user.id; // from auth middleware
    
            const result = await Notification.updateMany(
                { userId, isRead: false },
                { $set: { isRead: true } }
            );
    
            res.status(200).json({
                success: true,
                message: `Marked ${result.modifiedCount} notifications as read`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to mark notifications as read',
                error: error.message
            });
        }
    }
};