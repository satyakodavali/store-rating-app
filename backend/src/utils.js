// Wrap async handlers so rejected promises reach the error middleware
exports.wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Safe ORDER BY: column names come from a whitelist, never from user input
exports.orderBy = (q, allowed, def) => {
  const col = allowed[q.sortBy] || allowed[def];
  return `ORDER BY ${col} ${q.order === 'desc' ? 'DESC' : 'ASC'}, 1`;
};

// Builds a parameterised WHERE clause from query filters (ILIKE by default)
exports.filters = (q, map, exact = []) => {
  const conds = [];
  const params = [];
  for (const [key, col] of Object.entries(map)) {
    const v = typeof q[key] === 'string' ? q[key].trim() : '';
    if (!v) continue;
    params.push(exact.includes(key) ? v : `%${v}%`);
    conds.push(exact.includes(key) ? `${col} = $${params.length}` : `${col} ILIKE $${params.length}`);
  }
  return { where: conds.length ? 'WHERE ' + conds.join(' AND ') : '', params };
};
