const Question = require('../models/Question');

exports.createQuestion = (req, res) => {
  const { title, content, tags } = req.body;
  Question.create({ userId: req.user.userId, title, content, tags }, (err, q) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.status(201).json(q);
  });
};

exports.getAllQuestions = (req, res) => {
  Question.getAll((err, rows) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json(rows);
  });
};

exports.getQuestionById = (req, res) => {
  Question.getById(req.params.id, (err, row) => {
    if (err || !row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  });
};
