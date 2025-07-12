const Vote = require('../models/Vote');

exports.voteQuestion = (req, res) => {
  const { questionId } = req.params;
  const vt = req.body.voteType;
  Vote.cast(req.user.userId, questionId, 'question', vt, err => {
    err ? res.status(500).json({ message: 'Error' }) : res.json({ message: 'Voted' });
  });
};
