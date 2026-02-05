const express = require("express");
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const crypto = require("crypto");

const router = express.Router();

//adding note
router.post("/", auth, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await db.execute(
      "INSERT INTO notes (title, content, owner_id) VALUES (?, ?, ?)",
      [title, content, userId],
    );

    const noteId = result.insertId;
    await logActivity(userId, noteId, "create"); // log action
    req.io.emit("noteCreated", {
      id: noteId,
      title,
      content,
      owner_id: userId,
    });

    res.json({ id: noteId, title, content });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//geting user notes
router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM notes WHERE owner_id = ? ORDER BY id DESC",
      [userId],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//updating note
router.put("/:id", auth, async (req, res) => {
  const { title, content } = req.body;
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.execute(
      "UPDATE notes SET title=?, content=? WHERE id=? AND owner_id=?",
      [title, content, noteId, userId],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Note not found" });

    await logActivity(userId, noteId, "update"); // log action
    req.io.emit("noteUpdated", {
      id: noteId,
      title,
      content,
      owner_id: userId,
    });

    res.json({ message: "Note updated" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//deleteing note
router.delete("/:id", auth, async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    const [result] = await db.execute(
      "DELETE FROM notes WHERE id=? AND owner_id=?",
      [noteId, userId],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Note not found" });

    await logActivity(userId, noteId, "delete"); // log action
    req.io.emit("noteDeleted", { id: noteId, owner_id: userId });

    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Helper to log user actions
async function logActivity(userId, noteId, action) {
  try {
    await db.execute(
      "INSERT INTO activity_logs (user_id, note_id, action) VALUES (?, ?, ?)",
      [userId, noteId, action],
    );
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
}

router.get("/activity", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM activity_logs WHERE user_id=? ORDER BY created_at DESC",
      [userId],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ------------------ Search Notes ------------------ */
router.get("/search", auth, async (req, res) => {
  const userId = req.user.id;
  const query = req.query.q; // ?q=searchTerm

  if (!query)
    return res.status(400).json({ message: "Query parameter 'q' is required" });

  try {
    const [rows] = await db.execute(
      `SELECT * FROM notes 
       WHERE owner_id=? AND (title LIKE ? OR content LIKE ?) 
       ORDER BY id DESC`,
      [userId, `%${query}%`, `%${query}%`],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ------------------ Generate Shareable Link ------------------ */
router.post("/:id/share", auth, async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    // Generate a unique token
    const token = crypto.randomBytes(16).toString("hex");

    // Save token in DB
    const [result] = await db.execute(
      "UPDATE notes SET public_link=? WHERE id=? AND owner_id=?",
      [token, noteId, userId],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Note not found" });

    res.json({
      shareableLink: `${req.protocol}://${req.get("host")}/notes/public/${token}`,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ------------------ Get Public Note ------------------ */
router.get("/public/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const [rows] = await db.execute(
      "SELECT id, title, content, owner_id, created_at, updated_at FROM notes WHERE public_link=?",
      [token],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Note not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
