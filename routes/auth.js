const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hash],
    );

    res.json({ userId: result.insertId });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const user = rows[0];
    if (!user) return res.sendStatus(401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.sendStatus(401);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
