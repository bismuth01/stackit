const pool = require('../db');

exports.createAnswer = async ({ questionId, userId, content }) => {
  const res = await pool.query(
    `INSERT INTO answers (question_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [questionId, userId, content]
  );
  return res.rows[0];
};

exports.voteAnswer = async ({ answerId, voteType }) => {
  const modifier = voteType === 'up' ? 1 : -1;
  const res = await pool.query(
    `UPDATE answers SET vote_count = vote_count + $1 WHERE id = $2 RETURNING *`,
    [modifier, answerId]
  );
  return res.rows[0];
};
