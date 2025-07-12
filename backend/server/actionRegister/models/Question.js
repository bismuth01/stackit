const db = require('../db');

exports.create = (q, cb) => {
  const tags = q.tags.join(',');
  db.run(`INSERT INTO questions (user_id,title,content,tags) VALUES (?,?,?,?)`,
    [q.userId, q.title, q.content, tags], function(err) {
      cb(err, this.lastID ? { id: this.lastID, ...q } : null);
    });
};

exports.getAll = cb => {
  db.all(`SELECT * FROM questions ORDER BY created_at DESC`, cb);
};

exports.getById = (id, cb) => {
  db.get(`SELECT * FROM questions WHERE id = ?`, [id], cb);
};
