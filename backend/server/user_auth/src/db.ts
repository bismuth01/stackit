import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

// Connect to or create the DB
const db = new Database("users.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

export async function addUser(username: string, email: string, password: string) {
  const stmt = db.prepare(
    "INSERT INTO users (userId, username, email, password) VALUES (?, ?, ?, ?)"
  );
  const userId = randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  stmt.run(userId, username, email, hashedPassword);
  return { userId, username, email };
}


export function getAllUsers() {
  const stmt = db.prepare("SELECT userId, email FROM users");
  return stmt.all();
}

export async function verifyUser(username: string, password: string): Promise<boolean> {
  const stmt = db.prepare("SELECT password FROM users WHERE username = ?");
  const row = stmt.get(username) as { password: string } | undefined;

  if (!row) return false;
  return bcrypt.compare(password, row.password);
}

