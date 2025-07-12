const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/stackit.db', (err) => {
  if (err) console.error('DB open error', err);
});
module.exports = db;
