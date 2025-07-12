const express = require('express');
const { createQuestion, getAllQuestions, getQuestionById } = require('../controllers/questionController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, createQuestion);
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);

module.exports = router;
