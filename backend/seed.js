const pool = require('./config/db');

async function seed() {
  try {
    console.log('Seeding initial data with proper UTF-8...');
    await pool.query('SET NAMES utf8mb4');
    await pool.query('TRUNCATE TABLE wheel_options');
    await pool.query('DELETE FROM wheels WHERE id > 0');

    await pool.query(`
      INSERT INTO wheels (id, user_id, title, category, is_preset) VALUES
      (1, NULL, 'มื้อเที่ยงกินไรดีหน้ามอ?', 'food', TRUE),
      (2, NULL, 'ชานมไข่มุกแก้วนี้ ซื้อดีไหม?', 'decision', TRUE),
      (3, NULL, 'กิจกรรมแก้เบื่อช่วงพักเที่ยง', 'activity', TRUE)
    `);

    await pool.query(`
      INSERT INTO wheel_options (wheel_id, label, color) VALUES
      (1, 'ข้าวกะเพราหมูกรอบไข่ดาว', '#FF5733'),
      (1, 'ก๋วยเตี๋ยวต้มยำพิเศษ', '#33C1FF'),
      (1, 'ข้าวมันไก่ทอด+ต้ม', '#75FF33'),
      (1, 'ส้มตำไก่ย่างข้าวเหนียว', '#FFBD33'),
      (1, 'มาม่าปลากระป๋อง (เซฟเงิน)', '#900C3F'),
      (1, 'ชาบูจัดหนักมื้อเที่ยง', '#C70039'),
      (2, 'ซื้อเลย! วันนี้เหนื่อยมาพอแล้ว', '#2ECC71'),
      (2, 'ดื่มน้ำเปล่าเถอะ พุงจะออกแล้ว', '#E74C3C'),
      (2, 'สั่งหวาน 25% เป็นการประนีประนอม', '#F39C12'),
      (3, 'นอนงีบสัก 20 นาที', '#3498DB'),
      (3, 'เล่นเกม ROV สัก 1 ตา', '#9B59B6'),
      (3, 'ลุยอ่านสไลด์ Web App ล่วงหน้า', '#1ABC9C'),
      (3, 'เดินไปซื้อขนม 7-Eleven', '#E67E22')
    `);

    const [rows] = await pool.query('SELECT id, title FROM wheels');
    console.log('✅ Seeded successfully:');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
