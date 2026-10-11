const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'ไม่มี Token ยืนยันตัวตน (Access Denied)' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'decidr_super_secret_jwt_key_2026');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};
