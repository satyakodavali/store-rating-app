const RULES = {
  name: (v) => (typeof v === 'string' && v.length >= 20 && v.length <= 60) || 'Name must be 20-60 characters',
  email: (v) => (typeof v === 'string' && v.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || 'Enter a valid email address',
  address: (v) => (typeof v === 'string' && v.length <= 400) || 'Address must be at most 400 characters',
  password: (v) =>
    (typeof v === 'string' && /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(v)) ||
    'Password must be 8-16 characters with one uppercase letter and one special character',
  role: (v) => ['admin', 'user', 'owner'].includes(v) || 'Role must be admin, user or owner',
};

exports.validate = (...fields) => (req, res, next) => {
  const errors = {};
  for (const f of fields) {
    const r = RULES[f](req.body[f]);
    if (r !== true) errors[f] = r;
  }
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
  next();
};
