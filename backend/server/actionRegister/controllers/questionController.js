const questionModel = require('../models/questionModel');

exports.createQuestion = async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const question = await questionModel.createQuestion({
      userId: req.user.userId,
      title,
      content,
      tags,
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create question' });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await questionModel.getAllQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await questionModel.getQuestionById(req.params.id);
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Question not found' });
  }
};
