const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// ── JSON DB helpers ──────────────────────────────────────────────────────────
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'bus_attendance_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Auth middleware ──────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (req.session.admin) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// ── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const admin = db.admins.find(a => a.username === username);
  if (!admin || admin.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.admin = { id: admin.id, username: admin.username };
  res.json({ success: true, username: admin.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  if (req.session.admin) res.json({ loggedIn: true, username: req.session.admin.username });
  else res.json({ loggedIn: false });
});

// ── STUDENT ROUTES ───────────────────────────────────────────────────────────
app.get('/api/students', requireAuth, (req, res) => {
  const db = readDB();
  const sorted = [...db.students].sort((a, b) =>
    a.route_number - b.route_number || a.bus_number - b.bus_number || a.name.localeCompare(b.name)
  );
  res.json(sorted);
});

app.post('/api/students', requireAuth, (req, res) => {
  const { name, department, route_number, bus_number, qr_code_value } = req.body;
  const db = readDB();

  if (db.students.find(s => s.qr_code_value === qr_code_value)) {
    return res.status(400).json({ error: 'QR code value already exists' });
  }

  const id = db.students.length ? Math.max(...db.students.map(s => s.id)) + 1 : 1;
  const student = { id, name, department, route_number: +route_number, bus_number: +bus_number, qr_code_value };
  db.students.push(student);
  writeDB(db);
  res.json({ success: true, id });
});

app.delete('/api/students/:id', requireAuth, (req, res) => {
  const id = +req.params.id;
  const db = readDB();
  db.students = db.students.filter(s => s.id !== id);
  db.attendance = db.attendance.filter(a => a.student_id !== id);
  writeDB(db);
  res.json({ success: true });
});

// ── ATTENDANCE ROUTES ────────────────────────────────────────────────────────
app.post('/api/scan', (req, res) => {
  const { qr_code_value, location } = req.body;
  const db = readDB();

  const student = db.students.find(s => s.qr_code_value === qr_code_value);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];

  const already = db.attendance.find(a => a.student_id === student.id && a.date === date);
  if (already) return res.status(409).json({ error: 'Attendance already marked today', student });

  const id = db.attendance.length ? Math.max(...db.attendance.map(a => a.id)) + 1 : 1;
  db.attendance.push({ id, student_id: student.id, route_number: student.route_number, bus_number: student.bus_number, date, time, location: location || null });
  writeDB(db);

  res.json({ success: true, student, date, time });
});

app.get('/api/attendance', requireAuth, (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const db = readDB();

  const rows = db.attendance
    .filter(a => a.date === date)
    .map(a => {
      const s = db.students.find(s => s.id === a.student_id);
      return { ...a, name: s?.name, department: s?.department };
    })
    .sort((a, b) => a.route_number - b.route_number || a.bus_number - b.bus_number || a.time.localeCompare(b.time));

  res.json(rows);
});

app.get('/api/dashboard', requireAuth, (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const db = readDB();
  const todayAtt = db.attendance.filter(a => a.date === date);

  // Count per route+bus
  const summaryMap = {};
  todayAtt.forEach(a => {
    const key = `${a.route_number}_${a.bus_number}`;
    if (!summaryMap[key]) summaryMap[key] = { route_number: a.route_number, bus_number: a.bus_number, count: 0 };
    summaryMap[key].count++;
  });
  const summary = Object.values(summaryMap).sort((a, b) => a.route_number - b.route_number || a.bus_number - b.bus_number);

  // Count per route
  const routeMap = {};
  todayAtt.forEach(a => {
    if (!routeMap[a.route_number]) routeMap[a.route_number] = { route_number: a.route_number, total: 0 };
    routeMap[a.route_number].total++;
  });
  const routes = Object.values(routeMap).sort((a, b) => a.route_number - b.route_number);

  res.json({ summary, routes, totalToday: todayAtt.length, date });
});

app.get('/api/export', requireAuth, (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const db = readDB();

  const rows = db.attendance
    .filter(a => a.date === date)
    .map(a => {
      const s = db.students.find(s => s.id === a.student_id);
      return {
        'Student Name': s?.name,
        'Department': s?.department,
        'Route': a.route_number,
        'Bus': a.bus_number,
        'Date': a.date,
        'Time': a.time,
        'Location': a.location || 'N/A'
      };
    });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', `attachment; filename=attendance_${date}.xlsx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${DB_PATH}`);
  console.log(`🔑 Login: admin / admin123`);
});
