-- Smart College Bus Attendance System
-- Database: bus_attendance

CREATE DATABASE IF NOT EXISTS bus_attendance;
USE bus_attendance;

-- Admin/Bus Incharge login
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  route_number INT NOT NULL,
  bus_number INT NOT NULL,
  qr_code_value VARCHAR(100) UNIQUE NOT NULL
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  route_number INT NOT NULL,
  bus_number INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY unique_attendance (student_id, date)
);

-- Default admin (username: admin, password: admin123)
INSERT INTO admins (username, password) VALUES ('admin', '$2b$10$rQZ9uAVUE3YqKjV1e2mHOeWQkLmN8pXvYdCfGhIjKlMnOpQrStUvW');

-- Sample students
INSERT INTO students (name, department, route_number, bus_number, qr_code_value) VALUES
('Aarav Kumar',    'CSE', 1, 1, 'STU001'),
('Priya Sharma',   'ECE', 1, 1, 'STU002'),
('Rahul Verma',    'MECH',1, 2, 'STU003'),
('Sneha Patel',    'CSE', 1, 2, 'STU004'),
('Arjun Singh',    'IT',  2, 1, 'STU005'),
('Divya Nair',     'ECE', 2, 1, 'STU006'),
('Karan Mehta',    'CIVIL',2,2, 'STU007'),
('Ananya Reddy',   'CSE', 2, 2, 'STU008'),
('Vikram Joshi',   'MECH',3, 1, 'STU009'),
('Pooja Iyer',     'IT',  3, 1, 'STU010');
