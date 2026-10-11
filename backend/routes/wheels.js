const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/wheels - ดึงรายการวงล้อทั้งหมด (Preset + ของ User ถ้าล็อกอิน)
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || null;
    let query = 'SELECT * FROM wheels WHERE is_preset = TRUE';
    let params = [];

    if (userId) {
      query += ' OR user_id = ?';
      params.push(userId);
    }
    query += ' ORDER BY is_preset DESC, id DESC';

    const [wheels] = await db.query(query, params);
    res.json(wheels);
  } catch (error) {
    console.error('Fetch wheels error:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลวงล้อได้', error: error.message });
  }
});

// GET /api/wheels/:id - ดึงวงล้อพร้อมตัวเลือกทั้งหมด
router.get('/:id', async (req, res) => {
  try {
    const wheelId = req.params.id;
    const [wheels] = await db.query('SELECT * FROM wheels WHERE id = ?', [wheelId]);
    if (wheels.length === 0) {
      return res.status(404).json({ message: 'ไม่พบวงล้อที่ต้องการ' });
    }

    const [options] = await db.query('SELECT * FROM wheel_options WHERE wheel_id = ?', [wheelId]);
    res.json({
      ...wheels[0],
      options
    });
  } catch (error) {
    console.error('Fetch wheel details error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
});

// POST /api/wheels - สร้างวงล้อใหม่ของตัวเอง (ต้องล็อกอิน)
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, options } = req.body;
    const userId = req.user.id;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อวงล้อ และระบุตัวเลือกอย่างน้อย 2 ข้อ' });
    }

    // สร้าง Header วงล้อ
    const [wheelResult] = await db.query(
      'INSERT INTO wheels (user_id, title, category, is_preset) VALUES (?, ?, ?, FALSE)',
      [userId, title, category || 'custom']
    );
    const newWheelId = wheelResult.insertId;

    // เพิ่มตัวเลือกแต่ละข้อ
    const defaultColors = ['#FF5733', '#33C1FF', '#75FF33', '#FFBD33', '#9B59B6', '#E67E22', '#1ABC9C', '#E74C3C'];
    for (let i = 0; i < options.length; i++) {
      const label = options[i].label || options[i];
      const color = options[i].color || defaultColors[i % defaultColors.length];
      await db.query(
        'INSERT INTO wheel_options (wheel_id, label, color) VALUES (?, ?, ?)',
        [newWheelId, label, color]
      );
    }

    res.status(201).json({ message: 'สร้างวงล้อสำเร็จ', wheelId: newWheelId });
  } catch (error) {
    console.error('Create wheel error:', error);
    res.status(500).json({ message: 'ไม่สามารถสร้างวงล้อได้', error: error.message });
  }
});

// POST /api/wheels/:id/spin - บันทึกประวัติการสุ่ม
router.post('/:id/spin', auth, async (req, res) => {
  try {
    const wheelId = req.params.id;
    const { result_label } = req.body;
    const userId = req.user.id;

    if (!result_label) {
      return res.status(400).json({ message: 'ต้องระบุผลลัพธ์ที่สุ่มได้' });
    }

    // ตรวจสอบว่า wheelId มีอยู่ในตาราง wheels หรือไม่ (ป้องกัน FK error)
    const [wheels] = await db.query('SELECT id FROM wheels WHERE id = ?', [wheelId]);
    let targetWheelId = wheels.length > 0 ? wheels[0].id : null;

    if (!targetWheelId) {
      const [anyWheel] = await db.query('SELECT id FROM wheels LIMIT 1');
      if (anyWheel.length > 0) {
        targetWheelId = anyWheel[0].id;
      }
    }

    if (targetWheelId) {
      await db.query(
        'INSERT INTO spin_history (user_id, wheel_id, result_label) VALUES (?, ?, ?)',
        [userId, targetWheelId, result_label]
      );
    }

    res.json({ message: 'บันทึกประวัติการสุ่มเรียบร้อย' });
  } catch (error) {
    console.error('Record spin error:', error);
    res.status(500).json({ message: 'ไม่สามารถบันทึกประวัติได้', error: error.message });
  }
});

// GET /api/wheels/history/my - ดึงประวัติการสุ่มของฉัน
router.get('/history/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [history] = await db.query(`
      SELECT sh.id, sh.result_label, sh.created_at, w.title AS wheel_title
      FROM spin_history sh
      JOIN wheels w ON sh.wheel_id = w.id
      WHERE sh.user_id = ?
      ORDER BY sh.id DESC
      LIMIT 20
    `, [userId]);

    res.json(history);
  } catch (error) {
    console.error('Get spin history error:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงประวัติได้', error: error.message });
  }
});

module.exports = router;
