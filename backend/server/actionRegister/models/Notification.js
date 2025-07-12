const pool = require('../db');

exports.createNotification = async ({ recipientId, message, link, type }) => {
  const res = await pool.query(
    `INSERT INTO notifications (user_id, message, link, type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [recipientId, message, link, type]
  );
  return res.rows[0];
};

exports.getNotifications = async (userId) => {
  const res = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [userId]
  );
  return res.rows;
};

exports.markAsRead = async (notifId) => {
  const res = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1`,
    [notifId]
  );
  return res.rowCount;
};
