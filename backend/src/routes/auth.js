const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { wrap } = require('../utils');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

router.post('/signup', validate('name', 'email', 'address', 'password'), wrap(async (req, res) => {
  const { name, email, address, password } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO users(name,email,password_hash,address,role) VALUES($1,$2,$3,$4,'user') RETURNING id,name,role`,
    [name, email.toLowerCase(), await bcrypt.hash(password, 10), address]
  );
  res.status(201).json({ token: sign(rows[0]), user: rows[0] });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [String(email || '').toLowerCase()]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(String(password || ''), u.password_hash)))
    return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(u), user: { id: u.id, name: u.name, role: u.role } });
}));

router.put('/password', auth, validate('password'), wrap(async (req, res) => {
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    await bcrypt.hash(req.body.password, 10),
    req.user.id,
  ]);
  res.json({ message: 'Password updated' });
}));

module.exports = router;
