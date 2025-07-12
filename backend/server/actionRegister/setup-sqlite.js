const fs = require('fs');
const db = require('./db');
const setup = fs.readFileSync('./setup-sqlite.sql', 'utf-8');
db.exec(setup, err => {
  if (err) console.error('Setup failed', err);
  else console.log('Database initialized');
  db.close();
});
