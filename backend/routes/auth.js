const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register - สมัครสมาชิก
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
    }

    // ตรวจสอบว่ามี user นี้หรือยัง
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีในระบบแล้ว' });
    }

    // Hash รหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // บันทึกลง MySQL
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    // ออก JWT Token
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET || 'decidr_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      token,
      user: { id: result.insertId, username }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก', error: error.message });
  }
});

// POST /api/auth/login - เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
    }

    // ค้นหา user ในฐานข้อมูล
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ออก JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'decidr_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', error: error.message });
  }
});

module.exports = router;
