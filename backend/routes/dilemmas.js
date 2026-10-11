const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const db = require('../config/db');
const auth = require('../middleware/auth');

// ตั้งค่าที่เก็บรูปภาพที่อัปโหลดจาก Ionic Camera
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'dilemma-' + uniqueSuffix + path.extname(file.originalname || '.jpg'));
  }
});
const upload = multer({ storage });

// Helper: บุคลิกของ AI ผู้พิพากษา (System Prompts กวนๆ ปั่นๆ สนุกๆ)
const PERSONALITY_PROMPTS = {
  roast: `คุณคือ 'AI ผู้พิพากษาสายด่าตรง/กวนประสาทขั้นสุด (Roast Mode)' สไตล์ขวานผ่าซาก ไม่ไว้หน้าใคร ปากจัดแต่พูดความจริง 
เน้นประชดเรื่องเงินในบัญชี ความหน้ามืดตามัว เตือนสติแรงๆ แต่ฮาและตลก ห้ามตอบยาวเกิน 3-4 ประโยค 
และบรรทัดสุดท้ายต้องฟันธงชัดเจนคำเดียวว่า 'BUY' หรือ 'BYE' เท่านั้น!`,

  spoil: `คุณคือ 'AI ผู้พิพากษาสายสปอยล์/เข้าข้างสุดใจ/สายเปย์ (Spoil Mode)' มองว่าชีวิตเกิดมาชาติเดียว พรุ่งนี้โลกอาจจะแตก เงินหาใหม่ได้แต่ความสุขหาไม่ได้
ตอบเป็นภาษาไทยสุดฟิน เชียร์ให้ซื้อแบบตัวแม่จะแคร์เพื่อ ห้ามตอบยาวเกิน 3-4 ประโยค 
และบรรทัดสุดท้ายต้องฟันธงว่า 'BUY' ชัดเจน!`,

  logic: `คุณคือ 'AI ผู้พิพากษาสายตรรกะ/วิศวกรการเงินขั้นเทพ (Logic Mode)' 
วิเคราะห์ความคุ้มค่าเทียบกับค่าแรงขั้นต่ำ (ชั่วโมงละ 45-50 บาท) ผลกระทบต่อสภาพคล่อง และกฎระงับกิเลส 48 ชม. 
ตอบเป็นภาษาไทยสุภาพแต่เฉียบคม 2-3 ข้อ และบรรทัดสุดท้ายฟันธงว่า 'BUY' หรือ 'BYE' เท่านั้น!`,

  fortune: `คุณคือ 'AI ผู้พิพากษาสายหมอดูตาทิพย์/สายมูเตลูตัวตึง (Fortune Mode)' 
ทักดวงชะตา ราศีกระเป๋าตังค์รั่ว ไพ่ทาโรต์ พระราหูอมทรัพย์ ตอบกวนๆ ปนความเชื่อสนุกสนาน 2-3 ประโยค 
และบรรทัดสุดท้ายฟันธงชะตากรรมว่า 'BUY' หรือ 'BYE' เท่านั้น!`
};

// คลังคำตอบฉุกเฉิน (Smart Witty Fallback Pool) กวนๆ หลายสไตล์ เพื่อให้เดโมสดลื่นไหลและไม่ซ้ำซาก
function getWittyFallback(mode, title, price, guiltLevel = 50, hasImage = false) {
  const numPrice = Number(price) || 0;
  const foodCount = numPrice > 0 ? Math.round(numPrice / 60) : 0;
  const foodText = foodCount > 0 ? ` (เงินก้อนนี้กินข้าวกะเพราไข่ดาวได้ตั้ง ${foodCount} จานเชียวนะ!)` : '';
  const lustText = guiltLevel > 70 ? ' ดูท่าทางความอยากได้จะพุ่งปรี๊ดจนตามืดบอดแล้วสินะ' : '';

  const roastPool = [
    {
      verdict: 'BYE',
      reason: `(Roast AI) "${title}" ราคาตั้ง ${numPrice.toLocaleString()} บาท!${foodText}${lustText} เงินในบัญชีมีไม่ถึงเศษเสี้ยวของราคาป้ายเลยมั้ง ซื้อไปอาทิตย์หน้าได้แทะแกลบต้มน้ำปลาแน่ บ๊ายบายไปซะ อย่าหาทำ!`
    },
    {
      verdict: 'BYE',
      reason: `(Roast AI) เตือนสตินะ! ของชิ้นนี้ซื้อมาเห่อได้ 3 วันแล้วก็เอาไปวางฝุ่นเกาะในห้อง${foodText} เก็บเงินไว้จ่ายค่าไฟหรือซื้อของกินประทังชีวิตสิ้นเดือนเถอะ สั่ง BYE ด่วน!`
    },
    {
      verdict: numPrice > 0 && numPrice < 150 ? 'BUY' : 'BYE',
      reason: `(Roast AI) เห็นราคาแล้วกุมขมับ${lustText} ถามจริงว่าของมันจำเป็นต่อการมีชีวิตอยู่บนโลกใบนี้ขนาดนั้นเลยเหรอ? ถ้าตอบไม่ได้ก็กด BYE แล้วถอยห่างออกมาเดี๋ยวนี้!`
    }
  ];

  const spoilPool = [
    {
      verdict: 'BUY',
      reason: `(Spoil AI) จัดไปอย่าให้เสีย! "${title}" แค่ ${numPrice.toLocaleString()} บาทเอง! เกิดมาชาติเดียว ชาติหน้าก็ไม่ได้ใช้เงินแล้ว ทำงานเหนื่อยแทบตาย จะไม่ให้รางวัลตัวเองหน่อยเหรอ? BUY โลดดด!`
    },
    {
      verdict: 'BUY',
      reason: `(Spoil AI) ซื้อเลย! เงินทองเป็นของนอกกาย ไม่ตายก็หาใหม่ได้ แต่ถ้าของชิ้นนี้หมดสต็อกไป เธอจะนอนร้องไห้สามวันเจ็ดวัน จัดไปเลยตัวแม่ BUY!`
    }
  ];

  const logicPool = [
    {
      verdict: numPrice > 800 ? 'BYE' : 'BUY',
      reason: `(Logic AI) จากการคำนวณราคา ${numPrice.toLocaleString()} บาท เทียบกับค่าแรงขั้นต่ำ ต้องทำงานแลกมาเกือบ ${(numPrice / 45).toFixed(1)} ชั่วโมง${foodText} แนะนำให้ใช้กฎ Delay Gratification รอ 48 ชม. ถ้ายังอยากได้ค่อยทบทวนใหม่ คำตัดสิน: ${numPrice > 800 ? 'BYE' : 'BUY'}`
    },
    {
      verdict: numPrice > 1500 ? 'BYE' : 'BUY',
      reason: `(Logic AI) วิเคราะห์อัตราผลตอบแทนความสุข (ROI) ของ "${title}" พบว่าค่าเสื่อมราคาสูงและความจำเป็นอยู่ในเกณฑ์ปานกลาง${foodText} คำแนะนำทางการเงิน: ${numPrice > 1500 ? 'BYE' : 'BUY'}`
    }
  ];

  const fortunePool = [
    {
      verdict: 'BUY',
      reason: `(Fortune AI) ไพ่ทาโรต์เปิดออกมาได้ The Sun คู่กับ Wheel of Fortune! "${title}" ชิ้นนี้มีรังสีนำโชค ซื้อแล้วชีวิตจะสดใสเฮงๆ ปังๆ คำทำนายชี้ชัด: BUY!`
    },
    {
      verdict: 'BYE',
      reason: `(Fortune AI) ทักแรงนะ! พระศุกร์เข้าพระเสาร์แทรก ช่วงนี้ดาวการเงินตกเรือนมรณะ ถ้าจ่ายเงิน ${numPrice.toLocaleString()} บาทให้กับชิ้นนี้ กระเป๋าตังค์จะแฟบยาวถึงสิ้นเดือน แม่หมอฟันธง: BYE!`
    }
  ];

  const pools = { roast: roastPool, spoil: spoilPool, logic: logicPool, fortune: fortunePool };
  const targetPool = pools[mode] || roastPool;
  return targetPool[Math.floor(Math.random() * targetPool.length)];
}

// ฟังก์ชันเรียก Ollama (พร้อม Multi-variety Fallback เมื่อ Ollama ปิดอยู่)
async function callOllamaAI(prompt, mode, title, price, guiltLevel = 50, imagePath = null) {
  const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
  const systemPrompt = PERSONALITY_PROMPTS[mode] || PERSONALITY_PROMPTS.roast;
  
  const userContent = `หัวข้อที่กำลังตัดสินใจ: "${title}" ${price ? `(ราคา: ${price} บาท)` : ''} (ระดับความอยากได้ในใจ: ${guiltLevel}%)\nช่วยตัดสินใจและให้เหตุผลสั้นๆ ไม่เกิน 3 ประโยค และลงท้ายฟันธง BUY หรือ BYE`;

  try {
    const payload = {
      model: 'qwen2.5:3b',
      system: systemPrompt,
      prompt: userContent,
      stream: false
    };

    // หากมีรูปภาพ ลองแปลง base64 แนบไปกับโมเดล
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        const imageBuffer = fs.readFileSync(imagePath);
        payload.images = [imageBuffer.toString('base64')];
      } catch (imgErr) {}
    }

    const response = await axios.post(`${ollamaUrl}/api/generate`, payload, { timeout: 15000 });
    const aiText = response.data.response;
    const verdict = aiText.toUpperCase().includes('BUY') || aiText.includes('ซื้อ') ? 'BUY' : 'BYE';
    return { verdict, reason: aiText };
  } catch (err) {
    console.warn('Ollama offline or timed out, using witty smart fallback response');
    return getWittyFallback(mode, title, price, guiltLevel, !!imagePath);
  }
}

// POST /api/dilemmas/judge - ส่งคำตัดสินให้ AI (รองรับอัปโหลดรูปภาพ + guiltLevel + food conversion)
router.post('/judge', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, price, mode, guilt_level } = req.body;
    const userId = req.user.id;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const fullImagePath = req.file ? path.join(uploadDir, req.file.filename) : null;
    const guilt = Number(guilt_level) || 50;

    if (!title) {
      return res.status(400).json({ message: 'กรุณาระบุสิ่งที่ต้องการให้ตัดสินใจ' });
    }

    // ป้องกันการส่งซ้ำจาก Double-click หรือ Network Retry ในช่วง 3 วินาที
    const [recent] = await db.query(
      `SELECT id, title, price, image_path, mode, ai_verdict, ai_reason, created_at 
       FROM dilemmas 
       WHERE user_id = ? AND title = ? AND created_at >= NOW() - INTERVAL 3 SECOND 
       ORDER BY id DESC LIMIT 1`,
      [userId, title]
    );

    if (recent.length > 0) {
      const existing = recent[0];
      const numPrice = Number(existing.price) || 0;
      return res.json({
        id: existing.id,
        title: existing.title,
        price: numPrice,
        image_path: existing.image_path,
        mode: existing.mode,
        guilt_level: guilt,
        food_equivalent: numPrice > 0 ? `เท่ากับข้าวกะเพราไข่ดาว ${Math.round(numPrice / 60)} จาน 🍛` : null,
        ai_verdict: existing.ai_verdict,
        ai_reason: existing.ai_reason
      });
    }

    const selectedMode = mode || 'roast';
    const aiResult = await callOllamaAI(title, selectedMode, title, price, guilt, fullImagePath);

    // บันทึกลง MySQL
    const [result] = await db.query(`
      INSERT INTO dilemmas (user_id, title, price, image_path, mode, ai_verdict, ai_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, title, price || 0, imagePath, selectedMode, aiResult.verdict, aiResult.reason]);

    const numPrice = Number(price) || 0;
    const foodEquivalent = numPrice > 0 ? `เท่ากับข้าวกะเพราไข่ดาว ${Math.round(numPrice / 60)} จาน 🍛` : null;

    res.status(201).json({
      id: result.insertId,
      title,
      price: numPrice,
      image_path: imagePath,
      mode: selectedMode,
      guilt_level: guilt,
      food_equivalent: foodEquivalent,
      ai_verdict: aiResult.verdict,
      ai_reason: aiResult.reason
    });
  } catch (error) {
    console.error('Judge error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตัดสินใจ', error: error.message });
  }
});

// GET /api/dilemmas/my - ดึงประวัติคดีความ/การตัดสินใจของฉัน
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(`
      SELECT * FROM dilemmas
      WHERE user_id = ?
      ORDER BY id DESC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Get my dilemmas error:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลได้', error: error.message });
  }
});

// PUT /api/dilemmas/:id/feedback - บันทึกผลลัพธ์ (ภูมิใจ/เสียดาย)
router.put('/:id/feedback', auth, async (req, res) => {
  try {
    const { feedback } = req.body; // 'proud', 'regret'
    const dilemmaId = req.params.id;
    const userId = req.user.id;

    await db.query(`
      UPDATE dilemmas SET user_feedback = ?
      WHERE id = ? AND user_id = ?
    `, [feedback, dilemmaId, userId]);

    res.json({ message: 'บันทึกฟีดแบ็กเรียบร้อย' });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้', error: error.message });
  }
});

// GET /api/dilemmas/stats - สถิติความเสียดายและเงินที่เซฟได้
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) AS total_dilemmas,
        COALESCE(SUM(CASE WHEN ai_verdict = 'BYE' THEN price ELSE 0 END), 0) AS money_saved,
        COALESCE(SUM(CASE WHEN user_feedback = 'proud' THEN 1 ELSE 0 END), 0) AS proud_count,
        COALESCE(SUM(CASE WHEN user_feedback = 'regret' THEN 1 ELSE 0 END), 0) AS regret_count
      FROM dilemmas
      WHERE user_id = ?
    `, [userId]);

    const row = stats[0] || {};
    res.json({
      total_dilemmas: Number(row.total_dilemmas) || 0,
      money_saved: Number(row.money_saved) || 0,
      proud_count: Number(row.proud_count) || 0,
      regret_count: Number(row.regret_count) || 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลสถิติได้', error: error.message });
  }
});

// DELETE /api/dilemmas/:id - ลบคดีความ (เฉพาะของตัวเอง)
router.delete('/:id', auth, async (req, res) => {
  try {
    const dilemmaId = req.params.id;
    const userId = req.user.id;

    const [result] = await db.query(`
      DELETE FROM dilemmas WHERE id = ? AND user_id = ?
    `, [dilemmaId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบคดีความที่ต้องการลบ' });
    }

    res.json({ message: 'ลบคดีความเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete dilemma error:', error);
    res.status(500).json({ message: 'ไม่สามารถลบคดีความได้', error: error.message });
  }
});

module.exports = router;
