const pool = require('../db');

exports.createQuestion = async ({ userId, title, content, tags }) => {
  const res = await pool.query(
    `INSERT INTO questions (user_id, title, content, tags)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, title, content, tags]
  );
  return res.rows[0];
};

exports.getAllQuestions = async () => {
  const res = await pool.query(
    `SELECT * FROM questions ORDER BY created_at DESC`
  );
  return res.rows;
};

exports.getQuestionById = async (id) => {
  const res = await pool.query(`SELECT * FROM questions WHERE id = $1`, [id]);
  return res.rows[0];
};
