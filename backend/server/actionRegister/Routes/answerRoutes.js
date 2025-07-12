const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:questionId', authMiddleware, answerController.postAnswer);
router.post('/:id/vote', authMiddleware, answerController.voteAnswer);

module.exports = router;
