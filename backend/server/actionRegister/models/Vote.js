const db = require('../db');

exports.cast = (u, tid, tt, vt, cb) => {
  db.run(`INSERT OR REPLACE INTO votes (user_id,target_id,target_type,vote_type)
     VALUES (?,?,?,?)`, [u, tid, tt, vt], cb);
};
