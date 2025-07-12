import express from "express";
import {
  createUser, createQuestion, createAnswer, createComment, listQuestions
} from "./db";
import { db } from "./db";

const app = express();
app.use(express.json());

function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
  return [...new Set(matches.map(m => m.slice(1)))]; // Remove '@' and dedupe
}

async function sendNotification(payload: {
  type: 'mention' | 'answer' | 'comment',
  forUser: string,
  fromUser?: string,
  referenceId?: string,
  message: string
}) {
  try {
    await fetch("http://localhost:4000/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("❌ Notification failed:", e);
  }
}


app.post("/users", (req, res) => {
  const { username } = req.body;
  try {
    const user = createUser(username);
    res.status(201).json(user);
  } catch {
    res.status(400).json({ error: "Username already exists" });
  }
});

app.post("/questions", (req, res) => {
  const { authorId, title, body, tags } = req.body;
  if (!authorId || !title || !body || !Array.isArray(tags)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const question = createQuestion(authorId, title, body, tags);
  res.status(201).json(question);

  // Extract mentions
  const mentionedUsers = extractMentions(body);
  for (const mentioned of mentionedUsers) {
    sendNotification({
      type: "mention",
      forUser: mentioned,
      fromUser: authorId,
      referenceId: question.questionId,
      message: `You were mentioned in a question by ${authorId}`
    });
  }
});


app.post("/answers", (req, res) => {
  const { questionId, authorId, body } = req.body;
  if (!questionId || !authorId || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const answer = createAnswer(questionId, authorId, body);
  res.status(201).json(answer);

  // Notify question author (get from DB)
  const q = db.prepare("SELECT authorId FROM questions WHERE questionId = ?")
              .get(questionId) as { authorId: string };
  if (q && q.authorId !== authorId) {
    sendNotification({
      type: "answer",
      forUser: q.authorId,
      fromUser: authorId,
      referenceId: questionId,
      message: `${authorId} answered your question`
    });
  }

  // Mentions in answer body
  const mentionedUsers = extractMentions(body);
  for (const mentioned of mentionedUsers) {
    sendNotification({
      type: "mention",
      forUser: mentioned,
      fromUser: authorId,
      referenceId: answer.answerId,
      message: `You were mentioned in an answer by ${authorId}`
    });
  }
});


app.post("/comments", (req, res) => {
  const { parentType, parentId, authorId, body } = req.body;
  if (!['question', 'answer'].includes(parentType) || !parentId || !authorId || !body) {
    return res.status(400).json({ error: "Invalid comment payload" });
  }

  const comment = createComment(parentType, parentId, authorId, body);
  res.status(201).json(comment);

  // Mention handling
  const mentionedUsers = extractMentions(body);
  for (const mentioned of mentionedUsers) {
    sendNotification({
      type: "mention",
      forUser: mentioned,
      fromUser: authorId,
      referenceId: parentId,
      message: `You were mentioned in a comment by ${authorId}`
    });
  }

  // If commenting on an answer, notify the answer's author
  if (parentType === "answer") {
    const ans = db.prepare("SELECT authorId FROM answers WHERE answerId = ?")
                  .get(parentId) as { authorId: string };
    if (ans && ans.authorId !== authorId) {
      sendNotification({
        type: "comment",
        forUser: ans.authorId,
        fromUser: authorId,
        referenceId: parentId,
        message: `${authorId} commented on your answer`
      });
    }
  }
});


app.get("/questions", (req, res) => {
  const questions = listQuestions();
  res.json(questions);
});

app.listen(3000, () => {
  console.log("🚀 API running at http://localhost:3000");
});
