const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ message: 'No token provided' });
  const token = h.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (e, dec) => {
    if (e) return res.status(403).json({ message: 'Invalid token' });
    req.user = dec;
    next();
  });
};
