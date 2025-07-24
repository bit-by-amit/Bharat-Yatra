// backend/routes/auth.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper to read/write user data
function readUsers() {
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Simulated OTP store (in memory)
let otpStore = {};

// Register route
router.post('/register', (req, res) => {
  const { firstName, lastName, dob, mobile, email, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: 'User already exists' });
  }

  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    dob,
    mobile,
    email,
    password,
  };

  users.push(newUser);
  writeUsers(users);
  res.json({ success: true, user: newUser });
});

// Send OTP (Simulated)
router.post('/send-otp', (req, res) => {
  const { email, mobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email || mobile] = otp;
  console.log(`OTP for ${email || mobile}: ${otp}`);
  res.json({ success: true, otp }); // show for testing
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid OTP' });
  }
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => (u.email === username || u.mobile === username) && u.password === password);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

module.exports = router;
