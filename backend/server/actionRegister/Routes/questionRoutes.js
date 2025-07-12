const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/authMiddleware');

// POST: Ask a question
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const question = new Question({
      title,
      description,
      tags,
      author: req.user.userId,
    });
    await question.save();
    res.status(201).json({ message: 'Question posted', question });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: All questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET: Single question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username')
      .populate('acceptedAnswer');
    res.json(question);
  } catch (err) {
    res.status(404).json({ error: 'Question not found' });
  }
});

// PUT: Mark answer as accepted
router.put('/:id/accept/:answerId', auth, async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (question.author.toString() !== req.user.userId)
    return res.status(403).json({ message: 'Not authorized' });

  question.acceptedAnswer = req.params.answerId;
  await question.save();
  res.json({ message: 'Answer accepted' });
});

module.exports = router;
