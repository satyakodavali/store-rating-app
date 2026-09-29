const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { wrap, orderBy, filters } = require('../utils');
const { auth, role } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(auth, role('admin'));

router.get('/stats', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT (SELECT COUNT(*) FROM users)::int   AS users,
            (SELECT COUNT(*) FROM stores)::int  AS stores,
            (SELECT COUNT(*) FROM ratings)::int AS ratings`
  );
  res.json(rows[0]);
}));

router.post('/users', validate('name', 'email', 'address', 'password', 'role'), wrap(async (req, res) => {
  const { name, email, address, password, role: r } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO users(name,email,password_hash,address,role) VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,address,role`,
    [name, email.toLowerCase(), await bcrypt.hash(password, 10), address, r]
  );
  res.status(201).json(rows[0]);
}));

router.get('/users', wrap(async (req, res) => {
  const cols = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role::text' };
  const { where, params } = filters(req.query, cols, ['role']);
  const order = orderBy(req.query, cols, 'name');
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, u.role FROM users u ${where} ${order}`, params
  );
  res.json(rows);
}));

router.get('/users/:id', wrap(async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            CASE WHEN u.role = 'owner'
                 THEN (SELECT ROUND(AVG(r.rating),1)::float FROM ratings r JOIN stores s ON s.id = r.store_id WHERE s.owner_id = u.id)
            END AS rating
     FROM users u WHERE u.id = $1`, [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
}));

router.post('/stores', validate('name', 'email', 'address'), wrap(async (req, res) => {
  const { name, email, address, ownerEmail } = req.body;
  let ownerId = null;
  if (ownerEmail) {
    const o = await pool.query(`SELECT id FROM users WHERE email = $1 AND role = 'owner'`, [ownerEmail.toLowerCase()]);
    if (!o.rows[0]) return res.status(400).json({ message: 'No store owner found with that email' });
    ownerId = o.rows[0].id;
  }
  const { rows } = await pool.query(
    `INSERT INTO stores(name,email,address,owner_id) VALUES($1,$2,$3,$4) RETURNING id,name,email,address`,
    [name, email.toLowerCase(), address, ownerId]
  );
  res.status(201).json(rows[0]);
}));

router.get('/stores', wrap(async (req, res) => {
  const cols = { name: 's.name', email: 's.email', address: 's.address' };
  const { where, params } = filters(req.query, cols);
  const order = orderBy(req.query, { ...cols, rating: 'rating' }, 'name');
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.email, s.address, COALESCE(ROUND(AVG(r.rating),1),0)::float AS rating
     FROM stores s LEFT JOIN ratings r ON r.store_id = s.id ${where} GROUP BY s.id ${order}`, params
  );
  res.json(rows);
}));

module.exports = router;
