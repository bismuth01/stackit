const db = require('../db');

exports.create = (n, cb) => {
  db.run(`INSERT INTO notifications (user_id,message,link) VALUES (?,?,?)`,
    [n.userId, n.message, n.link], function(err) {
      cb(err, this.lastID ? { id: this.lastID, ...n } : null);
    });
};

exports.get = (userId, cb) => {
  db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [userId], cb);
};

exports.markRead = (id, cb) => {
  db.run(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id], cb);
};
