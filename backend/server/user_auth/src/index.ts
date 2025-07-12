import express from "express";
import { addUser, getAllUsers } from "./db";
import { verifyUser } from "./db";

const app = express();
app.use(express.json());

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing username, email, or password" });
  }

  try {
    const user = await addUser(username, email, password);
    res.status(201).json({ message: "User registered", user });
  } catch (e: any) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const valid = await verifyUser(username, password);
    res.json({ success: valid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/users", (req, res) => {
  const users = getAllUsers();
  res.json(users);
});

app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
