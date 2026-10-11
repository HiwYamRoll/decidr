-- ========================================================
-- Database Schema for Decidr (แอปช่วยตัดสินใจชีวิต & ผู้พิพากษา AI)
-- Course: 04-522-306 Web Application Development
-- ========================================================

CREATE DATABASE IF NOT EXISTS `decidr_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `decidr_db`;

-- 1. ตารางผู้ใช้งาน (Users) รองรับ JWT Authentication
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ตารางวงล้อสุ่ม (Wheels / Presets)
CREATE TABLE IF NOT EXISTS `wheels` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'general',
    `is_preset` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ตารางตัวเลือกในวงล้อ (Wheel Options)
CREATE TABLE IF NOT EXISTS `wheel_options` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `wheel_id` INT NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `color` VARCHAR(20) DEFAULT '#FF5733',
    FOREIGN KEY (`wheel_id`) REFERENCES `wheels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ตารางการตัดสินใจ / คดีความ AI / Buy or Bye (Dilemmas & Photo Snap)
CREATE TABLE IF NOT EXISTS `dilemmas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) DEFAULT 0.00,
    `image_path` VARCHAR(255) NULL,
    `mode` ENUM('roast', 'spoil', 'logic', 'fortune') DEFAULT 'roast',
    `ai_verdict` VARCHAR(50) NULL, -- 'BUY', 'BYE', 'A', 'B'
    `ai_reason` TEXT NULL,
    `user_feedback` ENUM('regret', 'proud', 'pending') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ตารางประวัติการหมุนวงล้อ (Spin History)
CREATE TABLE IF NOT EXISTS `spin_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `wheel_id` INT NOT NULL,
    `result_label` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`wheel_id`) REFERENCES `wheels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- ข้อมูลตัวอย่างเริ่มต้น (Preset Templates สำหรับเดโมสด)
-- ========================================================

-- วงล้อที่ 1: มื้อเที่ยงหน้ามอ
INSERT INTO `wheels` (`id`, `user_id`, `title`, `category`, `is_preset`) VALUES
(1, NULL, 'มื้อเที่ยงกินไรดีหน้ามอ?', 'food', TRUE),
(2, NULL, 'ชานมไข่มุกแก้วนี้ ซื้อดีไหม?', 'decision', TRUE),
(3, NULL, 'กิจกรรมแก้เบื่อช่วงพักเที่ยง', 'activity', TRUE);

-- ตัวเลือกวงล้อที่ 1 (ของกิน)
INSERT INTO `wheel_options` (`wheel_id`, `label`, `color`) VALUES
(1, 'ข้าวกะเพราหมูกรอบไข่ดาว', '#FF5733'),
(1, 'ก๋วยเตี๋ยวต้มยำพิเศษ', '#33C1FF'),
(1, 'ข้าวมันไก่ทอด+ต้ม', '#75FF33'),
(1, 'ส้มตำไก่ย่างข้าวเหนียว', '#FFBD33'),
(1, 'มาม่าปลากระป๋อง (เซฟเงิน)', '#900C3F'),
(1, 'ชาบูจัดหนักมื้อเที่ยง', '#C70039');

-- ตัวเลือกวงล้อที่ 2 (ชานม)
INSERT INTO `wheel_options` (`wheel_id`, `label`, `color`) VALUES
(2, 'ซื้อเลย! วันนี้เหนื่อยมาพอแล้ว', '#2ECC71'),
(2, 'ดื่มน้ำเปล่าเถอะ พุงจะออกแล้ว', '#E74C3C'),
(2, 'สั่งหวาน 25% เป็นการประนีประนอม', '#F39C12');

-- ตัวเลือกวงล้อที่ 3 (แก้เบื่อ)
INSERT INTO `wheel_options` (`wheel_id`, `label`, `color`) VALUES
(3, 'นอนงีบสัก 20 นาที', '#3498DB'),
(3, 'เล่นเกม ROV สัก 1 ตา', '#9B59B6'),
(3, 'ลุยอ่านสไลด์ Web App ล่วงหน้า', '#1ABC9C'),
(3, 'เดินไปซื้อขนม 7-Eleven', '#E67E22');
