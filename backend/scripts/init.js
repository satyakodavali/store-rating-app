require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

(async () => {
  await pool.query(fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8'));
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const pw = process.env.ADMIN_PASSWORD || 'Admin@1234';
  await pool.query(
    `INSERT INTO users(name,email,password_hash,address,role) VALUES($1,$2,$3,$4,'admin')`,
    ['System Administrator Account', email, await bcrypt.hash(pw, 10), 'Head Office']
  );
  console.log(`Schema created. Admin: ${email} / ${pw}`);
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
