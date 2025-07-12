const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const Question = require('../models/Question');

exports.postAnswer = (req, res) => {
  const { questionId } = req.params, { content } = req.body, uid = req.user.userId;
  Answer.create({ questionId, userId: uid, content }, (err, ans) => {
    if (err) return res.status(500).json({ message: 'Error' });
    Question.getById(questionId, (e, q) => {
      if (q.user_id !== uid) {
        Notification.create({ userId: q.user_id, message: 'New answer', link: `/q/${questionId}` }, () => {});
      }
      res.status(201).json(ans);
    });
  });
};

exports.voteAnswer = (req, res) => {
  const mod = req.body.voteType === 'up' ? 1 : -1;
  Answer.vote(req.params.id, mod, (err) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json({ message: 'Voted' });
  });
};
