// Mirrors backend validation rules
export const RULES = {
  name: (v) => (v.length >= 20 && v.length <= 60) || 'Name must be 20-60 characters',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
  address: (v) => v.length <= 400 || 'Address must be at most 400 characters',
  password: (v) =>
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(v) ||
    'Password must be 8-16 characters with one uppercase letter and one special character',
  role: (v) => ['admin', 'user', 'owner'].includes(v) || 'Choose a role',
};

export const validate = (values, names) => {
  const errs = {};
  for (const n of names) {
    if (!RULES[n]) continue;
    const r = RULES[n](values[n] || '');
    if (r !== true) errs[n] = r;
  }
  return errs;
};
