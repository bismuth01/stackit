// Basic packages
import express, {Request, Response} from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

import { authenticateJWT, AuthenticatedRequest } from "./middleware/AuthenticateJWT";

dotenv.config();

// Only for testing API
const JWT_SECRET = process.env.JWT_SECRET || "";

if(!process.env.DATABASE_URL){
    throw new Error("Database URL Missing");
}
const DATABASE_URL = process.env.DATABASE_URL;

export const db = new Pool({
  connectionString: DATABASE_URL,
});

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    console.log(`Server running`);
})

app.get("/notification/get", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const result = await db.query(
      "SELECT * FROM notification_details WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/notification/add", authenticateJWT, async (req: Request, res: Response) => {
  const {
    userId,
    type,
    message,
    actor_user_id,
    question_id,
    answer_id,
    comment_id,
  } = req.body;

  try {
    await db.query(
      `INSERT INTO notifications 
       (user_id, type, message, actor_user_id, question_id, answer_id, comment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, type, message, actor_user_id, question_id, answer_id, comment_id]
    );

    res.status(201).json({ message: "Notification added successfully" });
  } catch (err) {
    console.error("DB insert error:", err);
    res.status(500).json({ error: "Failed to add notification" });
  }
});

app.post("/notification/delete", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const notifId = req.query.notifId as string;
  const userId = req.user?.id;

  if (!notifId) {
    return res.status(400).json({ error: "Notification ID is required" });
  }

  try {
    const result = await db.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [notifId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Notification not found or unauthorized" });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("DB delete error:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});


app.post("/notification/read", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { notifId } = req.query;

  try {
    const result = await db.query(
      "SELECT mark_notifications_read($1, $2::UUID[])",
      [userId, [notifId]]
    );
    res.json({ updated: result.rows[0].mark_notifications_read });
  } catch (err) {
    console.error("Error marking notifications:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/login/:userId', (req:Request, res:Response) => {
    const userId = req.params.userId;
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})