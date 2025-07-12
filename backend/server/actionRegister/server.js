const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/questions', require('./Routes/questionRoutes'));
app.use('/api/answers', require('./Routes/answerRoutes'));
app.use('/api/votes', require('./Routes/voteRoutes'));
app.use('/api/notifications', require('./Routes/notificationRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
