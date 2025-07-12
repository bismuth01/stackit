// Basic packages
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

import {
  authenticateJWT,
  AuthenticatedRequest,
} from "./middleware/AuthenticateJWT";

dotenv.config();

// Only for testing API
const JWT_SECRET = process.env.JWT_SECRET || "";

if (!process.env.DATABASE_URL) {
  throw new Error("Database URL Missing");
}
const DATABASE_URL = process.env.DATABASE_URL;

export const db = new Pool({
  connectionString: DATABASE_URL,
});

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  console.log(`Server running`);
  res.json({ message: "Notification server is running", status: "OK" });
});

app.get(
  "/notification/get",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    try {
      const result = await db.query(
        "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
        [userId],
      );
      res.json({ notifications: result.rows, count: result.rows.length });
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ error: "Database error" });
    }
  },
);

app.post(
  "/notification/add",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      userId,
      type,
      message,
      actor_user_id,
      question_id,
      answer_id,
      comment_id,
    } = req.body;

    // Validate required fields
    if (!userId || !type || !message) {
      return res
        .status(400)
        .json({ error: "userId, type, and message are required" });
    }

    try {
      const result = await db.query(
        `INSERT INTO notifications
       (user_id, type, message, actor_user_id, question_id, answer_id, comment_id, created_at, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), false)
       RETURNING id`,
        [
          userId,
          type,
          message,
          actor_user_id,
          question_id,
          answer_id,
          comment_id,
        ],
      );

      res.status(201).json({
        message: "Notification added successfully",
        notificationId: result.rows[0].id,
      });
    } catch (err) {
      console.error("DB insert error:", err);
      res.status(500).json({ error: "Failed to add notification" });
    }
  },
);

app.delete(
  "/notification/delete/:notifId",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    const notifId = req.params.notifId;
    const userId = req.user?.id;

    if (!notifId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    try {
      const result = await db.query(
        `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
        [notifId, userId],
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ error: "Notification not found or unauthorized" });
      }

      res.json({ message: "Notification deleted successfully" });
    } catch (err) {
      console.error("DB delete error:", err);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  },
);

app.patch(
  "/notification/read/:notifId",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const notifId = req.params.notifId;

    if (!notifId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    try {
      const result = await db.query(
        "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id",
        [notifId, userId],
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ error: "Notification not found or unauthorized" });
      }

      res.json({
        message: "Notification marked as read",
        notificationId: result.rows[0].id,
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ error: "Database error" });
    }
  },
);

app.get("/login/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
