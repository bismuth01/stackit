const db = require('../db');

exports.create = (a, cb) => {
  db.run(`INSERT INTO answers (question_id,user_id,content) VALUES (?,?,?)`,
    [a.questionId, a.userId, a.content], function(err) {
      cb(err, this.lastID ? { id: this.lastID, ...a } : null);
    });
};

exports.vote = (id, mod, cb) => {
  db.run(`UPDATE answers SET vote_count = vote_count + ? WHERE id = ?`, [mod, id], cb);
};
