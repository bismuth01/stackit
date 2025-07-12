const answerModel = require('../models/Answer');
const notificationModel = require('../models/Notification');
const pool = require('../db');

exports.postAnswer = async (req, res) => {
  const { content } = req.body;
  const { questionId } = req.params;
  const userId = req.user.userId;

  try {
    const answer = await answerModel.createAnswer({ questionId, userId, content });
    const question = await pool.query(`SELECT user_id FROM questions WHERE id = $1`, [questionId]);
    const recipientId = question.rows[0]?.user_id;

    if (recipientId && recipientId !== userId) {
      await notificationModel.createNotification({
        recipientId,
        message: 'Someone answered your question',
        link: `/questions/${questionId}`,
        type: 'answer',
      });
    }

    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post answer' });
  }
};

exports.voteAnswer = async (req, res) => {
  const { voteType } = req.body;
  try {
    const answer = await answerModel.voteAnswer({
      answerId: req.params.id,
      voteType,
    });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to vote' });
  }
};
