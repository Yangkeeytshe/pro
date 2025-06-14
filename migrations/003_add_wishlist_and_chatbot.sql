-- Migration: Add Wishlist and Chatbot functionality
-- Date: 2024
-- Description: Creates tables for wishlist system and AI chatbot integration

-- --------------------------------------------------------
-- Table structure for table `wishlists`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  KEY `idx_user_wishlist` (`user_id`),
  KEY `idx_product_wishlist` (`product_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `chat_sessions`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chat_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` boolean DEFAULT TRUE,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_user_sessions` (`user_id`),
  CONSTRAINT `fk_chat_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `chat_messages`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `message_type` enum('user', 'bot') NOT NULL,
  `message_content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session_messages` (`session_id`, `created_at`),
  KEY `idx_message_type` (`message_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `wishlist_notifications`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `wishlist_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `notification_type` enum('price_drop', 'back_in_stock', 'sale') NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `new_price` decimal(10,2) DEFAULT NULL,
  `is_sent` boolean DEFAULT FALSE,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_notifications` (`user_id`),
  KEY `idx_product_notifications` (`product_id`),
  KEY `idx_notification_status` (`is_sent`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Insert sample data for testing (optional)
-- --------------------------------------------------------

-- Note: Uncomment the following lines if you want to add sample data for testing
-- Make sure to replace user_id and product_id with actual values from your database

-- Sample wishlist entries
-- INSERT INTO `wishlists` (`user_id`, `product_id`) VALUES
-- (2, 1),
-- (2, 3),
-- (3, 2),
-- (3, 4);

-- Sample chat session
-- INSERT INTO `chat_sessions` (`user_id`, `session_id`) VALUES
-- (2, 'sample-session-123'),
-- (NULL, 'anonymous-session-456');

-- Sample chat messages
-- INSERT INTO `chat_messages` (`session_id`, `message_type`, `message_content`) VALUES
-- ('sample-session-123', 'user', 'What is the difference between a Gho and Kira?'),
-- ('sample-session-123', 'bot', 'A Gho is the traditional robe worn by Bhutanese men, while a Kira is the traditional dress worn by Bhutanese women. The Gho is a knee-length robe tied at the waist with a belt called a Kera, while the Kira is an ankle-length dress worn with a jacket called a Tego.');

-- --------------------------------------------------------
-- Indexes for performance optimization
-- --------------------------------------------------------

-- Additional indexes for better query performance
CREATE INDEX `idx_wishlists_created_at` ON `wishlists` (`created_at`);
CREATE INDEX `idx_chat_sessions_created_at` ON `chat_sessions` (`created_at`);
CREATE INDEX `idx_chat_messages_created_at` ON `chat_messages` (`created_at`);
CREATE INDEX `idx_wishlist_notifications_created_at` ON `wishlist_notifications` (`created_at`);

-- --------------------------------------------------------
-- Migration completion
-- --------------------------------------------------------

-- Migration completed successfully
