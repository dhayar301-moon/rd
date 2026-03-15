# 🚌 Smart College Bus Attendance System using QR Code

A full-stack web application to track student bus attendance every morning using QR code scanning.

---

## 📁 Project Structure

```
bus-attendance-system/
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── index.html        ← Login page
│   ├── scanner.html      ← QR Scanner page
│   ├── dashboard.html    ← Route Dashboard
│   └── admin.html        ← Admin Panel
├── backend/
│   ├── server.js         ← Express server + all API routes
│   ├── setup-admin.js    ← One-time admin setup script
│   └── package.json
├── database/
│   └── schema.sql        ← MySQL schema + sample data
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (v8 or higher)
- A browser with camera access (Chrome recommended)

---

## 🚀 Setup Instructions

### Step 1 – Set up the Database

1. Open **MySQL Workbench** or **phpMyAdmin** or the MySQL command line.
2. Run the schema file:

```sql
source path/to/bus-attendance-system/database/schema.sql
```

Or copy-paste the contents of `database/schema.sql` and execute it.

This will:
- Create the `bus_attendance` database
- Create `admins`, `students`, and `attendance` tables
- Insert 10 sample students

---

### Step 2 – Configure Database Password

Open `backend/server.js` and find this section (around line 20):

```js
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',   // <-- Put your MySQL password here
  database: 'bus_attendance',
});
```

Also update the same in `backend/setup-admin.js`.

---

### Step 3 – Install Dependencies

Open a terminal and navigate to the backend folder:

```bash
cd bus-attendance-system/backend
npm install
```

---

### Step 4 – Create Admin Account

Run the setup script once to create the hashed admin password:

```bash
node setup-admin.js
```

Output: `✅ Admin account created: username=admin  password=admin123`

---

### Step 5 – Start the Server

```bash
node server.js
```

Or for auto-restart during development:

```bash
npm run dev
```

You should see: `Server running at http://localhost:3000`

---

### Step 6 – Open the App

Open your browser and go to:

```
http://localhost:3000
```

Login with:
- **Username:** `admin`
- **Password:** `admin123`

---

## 📱 How to Use

### Morning Attendance (Scanner)
1. Go to **Scanner** page
2. Click **Start Camera**
3. Point camera at student's QR code on their ID card
4. Attendance is automatically recorded ✅

### View Dashboard
1. Go to **Dashboard**
2. Select a date (default: today)
3. Click route tabs to filter by route
4. Click a bus card to see students on that bus
5. Click **Export Excel** to download attendance sheet

### Admin Panel
1. Go to **Admin** → **Add Student** to register new students
2. Go to **QR Codes** tab to view and print QR codes for ID cards
3. Manage students in the **Students** tab

---

## 🗄️ Database Tables

### `students`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Auto-increment |
| name | VARCHAR | Student full name |
| department | VARCHAR | e.g. CSE, ECE |
| route_number | INT | Bus route number |
| bus_number | INT | Bus number on that route |
| qr_code_value | VARCHAR | Unique QR code string (e.g. STU001) |

### `attendance`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Auto-increment |
| student_id | INT FK | References students.id |
| route_number | INT | Copied from student |
| bus_number | INT | Copied from student |
| date | DATE | Attendance date |
| time | TIME | Scan time |
| location | VARCHAR | GPS coordinates (optional) |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login | Admin login |
| POST | /api/logout | Admin logout |
| GET | /api/me | Check session |
| GET | /api/students | List all students |
| POST | /api/students | Add a student |
| DELETE | /api/students/:id | Delete a student |
| POST | /api/scan | Scan QR & mark attendance |
| GET | /api/attendance?date= | Get attendance for a date |
| GET | /api/dashboard?date= | Get summary stats |
| GET | /api/export?date= | Download Excel file |

---

## 🎯 Sample QR Code Values (for testing)

You can test the scanner by showing these values as QR codes:

| QR Value | Student | Route | Bus |
|----------|---------|-------|-----|
| STU001 | Aarav Kumar | 1 | 1 |
| STU002 | Priya Sharma | 1 | 1 |
| STU003 | Rahul Verma | 1 | 2 |
| STU005 | Arjun Singh | 2 | 1 |
| STU009 | Vikram Joshi | 3 | 1 |

Use any online QR code generator (e.g. https://qr.io) to generate test QR codes from these values.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Camera not working | Use Chrome/Edge, allow camera permission |
| Cannot connect to DB | Check MySQL is running, verify password in server.js |
| Login fails | Run `node setup-admin.js` again |
| Port 3000 in use | Change `PORT` in server.js to 3001 |
| CORS error | Make sure you open the app via `http://localhost:3000` not as a file |
