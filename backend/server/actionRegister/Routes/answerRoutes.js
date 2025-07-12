const express = require('express');
const { postAnswer, voteAnswer } = require('../controllers/answerController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/:questionId', auth, postAnswer);
router.post('/:id/vote', auth, voteAnswer);

module.exports = router;
