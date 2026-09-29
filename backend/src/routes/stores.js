const router = require('express').Router();
const pool = require('../db');
const { wrap, orderBy, filters } = require('../utils');
const { auth, role } = require('../middleware/auth');

router.use(auth, role('user'));

router.get('/', wrap(async (req, res) => {
  const cols = { name: 's.name', address: 's.address' };
  const { where, params } = filters(req.query, cols);
  params.push(req.user.id);
  const order = orderBy(req.query, { ...cols, rating: 'rating', myRating: '"myRating"' }, 'name');
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.address,
            COALESCE(ROUND(AVG(r.rating),1),0)::float AS rating,
            (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $${params.length}) AS "myRating"
     FROM stores s LEFT JOIN ratings r ON r.store_id = s.id ${where} GROUP BY s.id ${order}`, params
  );
  res.json(rows);
}));

// Create or modify the current user's rating for a store
router.put('/:id/rating', wrap(async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ message: 'Invalid store id' });
  await pool.query(
    `INSERT INTO ratings(user_id,store_id,rating) VALUES($1,$2,$3)
     ON CONFLICT (user_id,store_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()`,
    [req.user.id, req.params.id, rating]
  );
  res.json({ message: 'Rating saved', rating });
}));

module.exports = router;
