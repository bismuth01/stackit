const notificationModel = require('../models/Notification'); // 

exports.getUserNotifications = async (req, res) => {
  try {
    const notifs = await notificationModel.getNotifications(req.user.userId);
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await notificationModel.markAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};
