// Run this ONCE to set up the admin account with a hashed password
// Usage: node setup-admin.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setup() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'bus_attendance'
  });

  const hashed = await bcrypt.hash('admin123', 10);
  await db.query('DELETE FROM admins');
  await db.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashed]);
  console.log('✅ Admin account created: username=admin  password=admin123');
  await db.end();
}

setup().catch(console.error);
