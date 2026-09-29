const router = require('express').Router();
const pool = require('../db');
const { wrap, orderBy } = require('../utils');
const { auth, role } = require('../middleware/auth');

router.use(auth, role('owner'));

router.get('/dashboard', wrap(async (req, res) => {
  const s = await pool.query(
    `SELECT s.id, s.name, s.address, COALESCE(ROUND(AVG(r.rating),1),0)::float AS average, COUNT(r.id)::int AS count
     FROM stores s LEFT JOIN ratings r ON r.store_id = s.id WHERE s.owner_id = $1 GROUP BY s.id`, [req.user.id]
  );
  if (!s.rows[0]) return res.json({ store: null, raters: [] });
  const order = orderBy(req.query, { name: 'u.name', email: 'u.email', rating: 'r.rating', date: 'r.updated_at' }, 'date');
  const raters = await pool.query(
    `SELECT u.id, u.name, u.email, r.rating, r.updated_at AS date
     FROM ratings r JOIN users u ON u.id = r.user_id WHERE r.store_id = $1 ${order}`, [s.rows[0].id]
  );
  res.json({ store: s.rows[0], raters: raters.rows });
}));

module.exports = router;
