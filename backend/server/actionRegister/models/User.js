const db = require('../db');

exports.create = (u, cb) => {
  db.run(`INSERT INTO users (username,email,password_hash) VALUES (?,?,?)`, 
    [u.username, u.email, u.passwordHash], function (err) {
      cb(err, this.lastID ? { id: this.lastID, ...u } : null);
    });
};

exports.findByEmail = (email, cb) => {
  db.get(`SELECT * FROM users WHERE email = ?`, [email], cb);
};
