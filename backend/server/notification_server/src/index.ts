import express from "express";
import { addNotification, getNotificationsForUser } from "./db";

const app = express();
app.use(express.json());

app.post("/notify", (req, res) => {
  const { type, forUser, fromUser, referenceId, message } = req.body;

  if (!type || !forUser || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    addNotification({ type, forUser, fromUser, referenceId, message });
    res.status(201).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/notifications/:username", (req, res) => {
  const username = req.params.username;
  const notifications = getNotificationsForUser(username);
  res.json(notifications);
});

app.listen(4000, () => {
  console.log("🔔 Notification server running at http://localhost:4000");
});
