const Notification = require('../models/Notification');

exports.getNotifications = (req, res) => {
  Notification.get(req.user.userId, (err, rows) => {
    err ? res.status(500).json({ message: 'Error' }) : res.json(rows);
  });
};

exports.markAsRead = (req, res) => {
  Notification.markRead(req.params.id, err => {
    err ? res.status(500).json({ message: 'Error' }) : res.json({ message: 'Marked' });
  });
};
