const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// เสิร์ฟรูปภาพที่อัปโหลดจากกล้องให้ Frontend เรียกดูได้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wheels', require('./routes/wheels'));
app.use('/api/dilemmas', require('./routes/dilemmas'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Decidr API is running smoothly 🚀' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Decidr Backend API Server`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
