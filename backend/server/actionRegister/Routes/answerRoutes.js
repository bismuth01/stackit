const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { postAnswer, voteAnswer } = require('../controllers/answerController');

router.post('/:questionId', auth, postAnswer);
router.post('/:id/vote', auth, voteAnswer);

module.exports = router;
