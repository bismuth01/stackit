import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("notifications.db");

// Table schema
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('mention', 'answer', 'comment')),
    forUser TEXT NOT NULL,
    fromUser TEXT,
    referenceId TEXT,
    message TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

type NotificationInput = {
  type: 'mention' | 'answer' | 'comment';
  forUser: string;
  fromUser?: string;
  referenceId?: string;
  message: string;
};

export function addNotification(input: NotificationInput) {
  const stmt = db.prepare(`
    INSERT INTO notifications (id, type, forUser, fromUser, referenceId, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const id = randomUUID();
  stmt.run(id, input.type, input.forUser, input.fromUser ?? null, input.referenceId ?? null, input.message);
}

export function getNotificationsForUser(username: string) {
  return db.prepare(`
    SELECT id, type, fromUser, referenceId, message, createdAt
    FROM notifications
    WHERE forUser = ?
    ORDER BY createdAt DESC
  `).all(username);
}
