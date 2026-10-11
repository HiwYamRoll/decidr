# 🎯 Decidr — แอปช่วยตัดสินใจชีวิต & ผู้พิพากษา AI (Smart Dilemma Solver & AI Judge)
> **โครงงานวิชา:** 04-522-306 การพัฒนาเว็บแอปพลิเคชัน (อ.สันติ สถิตวรรธนะ)  
> **เทคโนโลยี:** Ionic Angular (Side Menu) + Node.js Express REST API + MySQL + JWT Authentication + Local AI (Ollama qwen2.5:3b) + Capacitor Camera + Web Audio Synth + Haptics & Confetti

---

## 📌 จุดเด่นและฟีเจอร์ระดับ Next-Level (God-Tier Features)

1. **🎡 วงล้อตัดสินใจติดเทอร์โบ (0.8s Quadratic Ease-out Wheel):**
   * วงล้อ Canvas HiDPI คมชัดระดับ Retina Display
   * **Trigonometry Orientation:** ตัวหนังสืออ่านจากซ้ายไปขวาเสมอ (ห้ามกลับหัว 100%)
   * **Auto-Font Scale:** ปรับขนาดย่อฟอนต์อัตโนมัติ ไม่ตัดคำด้วย `...`
   * **Center Hub 18px:** แกนหมุนตรงกลางมินิมอล ไม่บังตัวอักษร
   * **Sensory Feedback:** สั่นในมือ (Haptics) + เสียงติ๊กเข็มสะกิด + พลุกระดาษระเบิด (Confetti) เมื่อหยุด
   * **Quick Fun Presets:** ปุ่มสลับหัวข้อยอดฮิตด่วน (ของกิน, ชานม, ที่เที่ยว, กิจกรรมแก้เบื่อ)

2. **⚖️ ผู้พิพากษา AI (Buy or Bye & Camera Snap):**
   * ถ่ายรูปสินค้า/ป้ายราคาด้วย **Ionic Capacitor Camera** (PWA Elements รองรับทั้งเว็บและมือถือ)
   * **🔥 Guilt & Lust Meter (เกจวัดกิเลส 1-100%):** เลื่อนสเกลวัดระดับความหน้ามืดตามัว
   * **🍛 Food Equivalent Calculator:** คำนวณราคาสินค้าเทียบเป็นจำนวนจานข้าวกะเพราหรือแก้วชานมไข่มุก
   * **4 บุคลิก AI ผู้พิพากษาสุดกวน:**
     * 😈 **Roast Mode:** สายด่าตรง/กวนประสาท ดึงสติความหน้ามืดตามัว
     * 💸 **Spoil Mode:** สายสปอยล์/เข้าข้างสุดใจ เชียร์ให้ซื้อตัวแม่จะแคร์เพื่อ
     * 🤖 **Logic Mode:** สายตรรกะ/วิศวกรการเงิน วิเคราะห์ค่าแรงขั้นต่ำและ ROI
     * 🔮 **Fortune Mode:** สายหมอดู/สายมูเตลู ทักดวงชะตากระเป๋าตังค์รั่ว
   * **Stamp Slam Animation:** แอนิเมชันตรายางกระแทกฟันธง `BUY` หรือ `BYE` ตัวยักษ์
   * **Smart Witty Fallback:** สำรองคำตัดสินกวนๆ หลากหลายสไตล์ ไม่พังเมื่อ Ollama ปิดอยู่

3. **📸 Viral Social Story Card (9:16 IG / TikTok Shareable):**
   * ปุ่ม **"ออกบัตรคำพิพากษาแชร์ลง Story"**
   * เรนเดอร์รูปภาพแนวตั้ง 9:16 ความละเอียดสูงด้วย HTML5 Canvas
   * ใส่รูปถ่ายสินค้า + ตรายาง BUY/BYE + คำตัดสินสุดจี๊ดของ AI + สถิติเงิน
   * กด **Save Image** ลงเครื่องได้ทันที พร้อมโพสต์อวดเพื่อน

4. **🐷 กระปุกออมสินเสมือนจริง (Piggy Bank & Saving Milestone Tracker):**
   * ตั้งเป้าหมายชีวิต เช่น *"เก็บเงินซื้อ iPad Air"* หรือ *"ทริปเที่ยวญี่ปุ่น"*
   * ทุกครั้งที่ AI สั่ง `BYE` แล้วผู้ใช้กดภูมิใจ เงินจะถูกสะสมเข้ากระปุกออมสิน
   * มีหลอด Progress Bar และสรุปว่าเงินที่ประหยัดได้ ซื้อข้าวกะเพราได้กี่ร้อยจานแล้ว!
   * ตัวกรองคดีความย้อนหลัง (ทั้งหมด / เฉพาะ BUY / เฉพาะ BYE)

5. **🔐 ความปลอดภัยระดับ Enterprise (JWT & Bcrypt):**
   * รหัสผ่านแฮชด้วย `bcryptjs` (Salt Rounds 10)
   * ยืนยันตัวตนด้วย JSON Web Token (JWT)

---

## 📁 โครงสร้างโปรเจกต์ (Project Architecture)

```text
E:\Project Web app\
├── 📁 frontend\          <-- Ionic Angular App (Side Menu + PWA + Camera)
│   ├── src/app/pages/wheel/       (วงล้อ Canvas HiDPI + Haptics + Confetti + Fun Presets)
│   ├── src/app/pages/ai-judge/    (ถ่ายรูป + Guilt Meter + 4 AI Personas + Social Card)
│   ├── src/app/pages/history/     (Piggy Bank Milestone + สถิติเซฟเงิน + กรองคดี)
│   ├── src/app/pages/login/       (เข้าสู่ระบบ / สมัครสมาชิก ด้วย JWT)
│   ├── src/app/services/
│   │   ├── api.service.ts         (REST API Client)
│   │   ├── auth.service.ts        (JWT Session Management)
│   │   ├── sound-fx.service.ts    (Web Audio API Synthesizer)
│   │   ├── confetti.service.ts    (Canvas Particle Confetti Engine)
│   │   ├── haptics.service.ts     (Capacitor Vibration Feedback)
│   │   └── social-card.service.ts (IG/TikTok Story 9:16 Image Generator)
├── 📁 backend\           <-- REST API Server (Node.js + Express)
│   ├── routes/auth.js             (จัดการ JWT Authentication)
│   ├── routes/wheels.js           (จัดการวงล้อ & บันทึก spin_history)
│   ├── routes/dilemmas.js         (เชื่อมต่อ Ollama + Vision + Witty Fallback Engine)
│   ├── config/db.js               (MySQL Connection Pool)
│   └── server.js                  (Entry Point API Port 5000)
├── 📁 database\          <-- Schema MySQL
│   └── schema.sql                 (ตาราง users, wheels, dilemmas, history)
└── 📄 README.md
```

---

## 🚀 วิธีเปิดใช้งานระบบ (How to Run)

### 1. เปิดฐานข้อมูล MySQL (XAMPP)
* เปิด **XAMPP Control Panel** และกด **Start** ที่ **MySQL**
* Import ไฟล์: `database/schema.sql` เข้า MySQL (Database: `decidr_db`)

### 2. รัน Backend API
```bash
cd "e:\Project Web app\backend"
node server.js
```
*(เซิร์ฟเวอร์จะทำงานที่ `http://localhost:5000`)*

### 3. รัน Frontend Ionic
```bash
cd "e:\Project Web app\frontend"
npx ionic serve
```
*(แอปจะเปิดขึ้นมาที่ `http://localhost:8100` อัตโนมัติ)*

### 4. รัน Local AI (ทางเลือกเสริม)
```bash
ollama run qwen2.5:3b
```
*(หากไม่ได้เปิด Ollama ระบบมี Smart Fallback กวนๆ ปั่นๆ ให้ใช้งานได้ลื่นไหล 100%)*
