const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, "[]", "utf8");
  }
}

function readFeedback() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(FEEDBACK_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeFeedback(entries) {
  ensureDataFile();
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2), "utf8");
}

function sanitize(text, maxLen) {
  return String(text || "")
    .trim()
    .slice(0, maxLen)
    .replace(/[<>]/g, "");
}

app.get("/api/feedback", (_req, res) => {
  const entries = readFeedback()
    .filter((entry) => entry.approved !== false)
    .slice(-12)
    .reverse()
    .map(({ id, name, rating, message, createdAt }) => ({
      id,
      name,
      rating,
      message,
      createdAt,
    }));

  res.json({ feedback: entries });
});

app.post("/api/feedback", (req, res) => {
  const name = sanitize(req.body.name, 80);
  const email = sanitize(req.body.email, 120);
  const message = sanitize(req.body.message, 1000);
  const rating = Number(req.body.rating);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Please enter your name (at least 2 characters)." });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  if (!message || message.length < 10) {
    return res.status(400).json({ error: "Feedback message must be at least 10 characters." });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Please select a rating from 1 to 5 stars." });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    email,
    rating,
    message,
    createdAt: new Date().toISOString(),
    approved: true,
  };

  const entries = readFeedback();
  entries.push(entry);
  writeFeedback(entries);

  res.status(201).json({
    success: true,
    message: "Thank you! Your feedback has been submitted.",
    feedback: {
      id: entry.id,
      name: entry.name,
      rating: entry.rating,
      message: entry.message,
      createdAt: entry.createdAt,
    },
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  ensureDataFile();
  console.log(`Portfolio running at http://localhost:${PORT}`);
});
