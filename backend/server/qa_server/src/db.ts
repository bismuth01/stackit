import Database from "better-sqlite3";
import { randomUUID } from "crypto";

export const db = new Database("stacklite.db");

// ─── Tables ──────────────────────────────────────────────────────
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  userId TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  questionId TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  authorId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS answers (
  answerId TEXT PRIMARY KEY,
  questionId TEXT NOT NULL,
  body TEXT NOT NULL,
  authorId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
  commentId TEXT PRIMARY KEY,
  parentType TEXT CHECK(parentType IN ('question', 'answer')) NOT NULL,
  parentId TEXT NOT NULL,
  body TEXT NOT NULL,
  authorId TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  tagId TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS question_tags (
  questionId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  PRIMARY KEY (questionId, tagId)
);
`);

// ─── Helper Functions ────────────────────────────────────────────

export function createUser(username: string) {
  const stmt = db.prepare("INSERT INTO users (userId, username) VALUES (?, ?)");
  const userId = randomUUID();
  stmt.run(userId, username);
  return { userId, username };
}

export function createQuestion(authorId: string, title: string, body: string, tags: string[]) {
  const questionId = randomUUID();
  db.prepare("INSERT INTO questions (questionId, title, body, authorId) VALUES (?, ?, ?, ?)")
    .run(questionId, title, body, authorId);

  const tagStmt = db.prepare("INSERT OR IGNORE INTO tags (tagId, name) VALUES (?, ?)");
  const linkStmt = db.prepare("INSERT OR IGNORE INTO question_tags (questionId, tagId) VALUES (?, ?)");

  for (const tag of tags) {
    const tagId = randomUUID();
    try {
      tagStmt.run(tagId, tag);
    } catch {}
    const row = db.prepare("SELECT tagId FROM tags WHERE name = ?").get(tag) as { tagId: string };
    linkStmt.run(questionId, row.tagId);
  }

  // TODO: Parse mentions (e.g. @username) and send to another server here
  return { questionId, title, body, tags };
}

export function createAnswer(questionId: string, authorId: string, body: string) {
  const answerId = randomUUID();
  db.prepare("INSERT INTO answers (answerId, questionId, body, authorId) VALUES (?, ?, ?, ?)")
    .run(answerId, questionId, body, authorId);
  return { answerId, body };
}

export function createComment(parentType: 'question' | 'answer', parentId: string, authorId: string, body: string) {
  const commentId = randomUUID();
  db.prepare("INSERT INTO comments (commentId, parentType, parentId, body, authorId) VALUES (?, ?, ?, ?, ?)")
    .run(commentId, parentType, parentId, body, authorId);
  return { commentId, body };
}

export function listQuestions() {
  return db.prepare(`
    SELECT q.questionId, q.title, q.body, q.createdAt, u.username AS author
    FROM questions q
    JOIN users u ON u.userId = q.authorId
    ORDER BY q.createdAt DESC
  `).all();
}
