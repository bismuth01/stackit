const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

exports.register = (req, res) => {
  const { username, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  User.create({ username, email, passwordHash: hash }, (err, user) => {
    if (err) return res.status(400).json({ message: 'Registration failed' });
    res.status(201).json(user);
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  });
};
