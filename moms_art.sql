-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 08:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `moms_art`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`) VALUES
(1, 'Siraj', 'siraj@gmail.com', '$2b$10$5dy5U9kc1IsSrcYw0hr1buiew6qvLagyvQIZzT4NIHp1AhpXwqvLS'),
(2, 'Yangki', 'yangki@gmail.com', '$2b$10$5dy5U9kc1IsSrcYw0hr1buiew6qvLagyvQIZzT4NIHp1AhpXwqvLS');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter`
--

CREATE TABLE `newsletter` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `newsletter`
--

INSERT INTO `newsletter` (`id`, `email`, `subscribed_at`) VALUES
(1, 'Yangkeeytshering57@gmail.com', '2025-05-17 18:54:50'),
(2, 'Yangkeeytshering57@gmail.com', '2025-05-18 07:37:51');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `date_uploaded` datetime DEFAULT current_timestamp(),
  `rating` decimal(3,2) DEFAULT 0.00,
  `image` varchar(255) DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `track_inventory` boolean DEFAULT TRUE,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL UNIQUE,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `is_active` boolean DEFAULT TRUE,
  `featured` boolean DEFAULT FALSE,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `date_uploaded`, `rating`, `image`) VALUES
(1, '7 Wrap Stripes', 'Women', 11999.00, '2025-01-10 10:00:00', 4.50, '/productimage/p1.png'),
(2, '5 Wrap Stripes', 'Men', 10549.00, '2025-05-09 11:15:00', 4.00, '/productimage/p2.png'),
(3, '3 Wrap Stripes', 'Women', 5199.00, '2025-05-08 09:30:00', 3.80, '/productimage/p3.png'),
(4, 'Mixed Pattern Kira', 'Women', 22259.00, '2025-05-07 14:45:00', 4.70, '/productimage/p4.png'),
(5, '3 Wrap Stripes', 'Women', 5299.00, '2025-05-06 16:00:00', 3.90, '/productimage/p5.png'),
(6, '3 Wrap Stripes Kira', 'Women', 4999.00, '2025-05-05 08:20:00', 4.10, '/productimage/p6.png'),
(7, '5 Wrap Stripes Gho', 'Men', 16999.00, '2025-05-04 12:10:00', 4.30, '/productimage/p7.png'),
(8, '7 Wrap Stripes Silk', 'Men', 19999.00, '2025-05-03 13:55:00', 4.60, '/productimage/p8.png'),
(9, 'Cotton Kira', 'Women', 18999.00, '2025-05-02 15:30:00', 4.20, '/productimage/p9.png'),
(10, 'Shinglo Sersho', 'Men', 15549.00, '2025-05-01 17:45:00', 3.70, '/productimage/p10.png'),
(11, 'Silk coffee colour) ', 'Women', 25199.00, '2025-04-30 10:05:00', 4.80, '/productimage/p11.png'),
(12, 'Kishuthara', 'Women', 222259.00, '2025-04-29 11:30:00', 5.00, '/productimage/p12.png'),
(13, 'Jabgangma', 'Women', 5299.00, '2025-04-28 14:00:00', 3.60, '/productimage/p13.png'),
(14, 'Pure Silk Kira', 'Men', 4999.00, '2025-04-27 09:15:00', 4.00, '/productimage/p14.png'),
(15, '5 Wrap Stripes', 'Men', 16999.00, '2025-04-26 16:45:00', 4.40, '/productimage/p15.png'),
(16, 'Pure Silk Gho', 'Men', 19999.00, '2025-04-25 12:00:00', 4.50, '/productimage/p16.png'),
(17, 'Eterna long dress red', 'Women', 17999.00, '2025-04-24 10:30:00', 4.30, '/productimage/p17.jpg'),
(18, 'Elegant Brocade Kira', 'Women', 5499.00, '2025-04-23 11:45:00', 3.90, '/productimage/p18.jpg'),
(19, 'Festive Woven kira', 'Women', 18999.00, '2025-04-22 15:20:00', 4.20, '/productimage/p19.jpg'),
(20, 'Silk Blend Kira', 'Women', 4599.00, '2025-04-21 13:00:00', 3.80, '/productimage/p20.jpg'),
(21, 'Traditional Bhutan Scarf', 'Accessories', 15999.00, '2025-04-20 16:00:00', 4.00, '/productimage/p21.jpg'),
(22, 'Floral Silk Rachu', 'Accessories', 4899.00, '2025-04-19 10:45:00', 4.10, '/productimage/p22.jpg'),
(23, 'Minimal Stripe Belt', 'Accessories', 14999.00, '2025-04-18 09:30:00', 4.00, '/productimage/p23.jpg'),
(24, 'Royal Blue Belt', 'Accessories', 5799.00, '2025-04-17 14:15:00', 4.20, '/productimage/p24.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `profilePic` varchar(255) DEFAULT '/images/default-avatar.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `street`, `city`, `state`, `zip`, `country`) VALUES
(2, 'ss', 's@1', '$2b$10$VLQ3tp1BItnEwEeFMrSajOL.ghCEYTwzgCf4VV/DZk2Qbe4aeDT0.', NULL, NULL, NULL, NULL, NULL),
(3, 'ty', 'ty1@gmail.com', '$2b$10$0v4UlnBCT/Ab.Wr/ZgIGLuyAe66I172ld9uvGtciROSD81jkncHZ6', NULL, NULL, NULL, NULL, NULL),
(4, 'tshe', 'tshe1@gmail.com', '$2b$10$Vht03rpuBpvF5V4TJjFViOlwBDHoAavQIvpopQ2KazocESgg./dDW', NULL, NULL, NULL, NULL, NULL),
(5, 'yang', 'yang@1', '$2b$10$IYPAEe8E0V/Sz5ommn7ayOzkNH5odVp6uMJ8/lhgiFRdqkpjyvTkK', NULL, NULL, NULL, NULL, NULL),
(6, 'u', 'u@1', '$2b$10$JNYj700QCOxlnYolGAJJ2ePVPFPgI0RVe2wFZz8QU0i3bsqHzcKc2', NULL, NULL, NULL, NULL, NULL),
(7, 'daza', 'daza@1', '$2b$10$NX.bMT8WQjQojuVEmF8cvuNyK3Yguiq1BcBIPwmuY8KtqG0QUqLVe', NULL, NULL, NULL, NULL, NULL),
(8, 'Tshering', 'Tshering@1gmail.com', '$2b$10$qoU.FCAeL9tuA/9ZhgTsrOtz.7BkW9nDpIXrdKJXOyf3mXW2pRiDi', NULL, NULL, NULL, NULL, NULL),
(9, 'Yangki', 'Yangki1@gmail.com', '$2b$10$o0AJRuAqbj6EMUng5Qay8OhMujK2Lfg1QswumXZGA5rv96/e.3mp2', NULL, NULL, NULL, NULL, NULL),
(10, 'Sangay', 'Sangay1@gmail.com', '$2b$10$IDh0nlfBheyiebUMvcWoiOK5yOX7jZUf5Drjom1XcihTrCDr5XOGW', NULL, NULL, NULL, NULL, NULL),
(11, 'yang', 'y@2', '$2b$10$1V3lgLwVjEzOHS5DIS0qKe1t4B5GMRKjN8eMknHwaPgC./QGerHHG', '42 Telopea Lane, wembley WA, Australia', 'wembley', 'WA', '6014', 'Australia'),
(12, 'Tshering Yangki', 'Yangkeeytshering57@gmail.com', '$2b$10$gc6fQsqdIQ8MiwhmV.qCVuOwiGbibEuEugN55y8BirwY1PqVlnakO', NULL, NULL, NULL, NULL, NULL),
(13, 't', 't@1', '$2b$10$7pf6qxuuScDcwlGRNq4d1OpuN9vWXGuWVqj3Tui4WjfmvWAEsEqhi', '42 Telopea Lane, wembley WA, Australia', 'wembley', 'WA', '6014', 'Australia'),
(14, '4', 't@4', '$2b$10$bYitTktxvuBMn0lnRFGCV.YXCevMkAV9toaHQXPu7ElMA5z5oXsY6', NULL, NULL, NULL, NULL, NULL),
(15, 'i@2', 'i@2', '$2b$10$hbzlYEaXFADlN/Q0.nIQZOSEVLcnuSy6ntVO.DhNUuNnaoaa9y0L.', '42 Telopea Lane, wembley WA, Australia', 'wembley', 'WA', '6014', 'Australia'),
(16, 'q', 'q@1', '$2b$10$fYnPrVp5kG6xi1dh68a9O.Sh/XB/KXNf7fuVqzT0zTG3AuZzjpRyq', NULL, NULL, NULL, NULL, NULL),
(17, 'a', 'a@1', '$2b$10$wx8G715q6RvJ5Fjy6gZ.yel4n3ETTVVxn/ibfZguHVmUANJ6VPJvy', NULL, NULL, NULL, NULL, NULL),
(18, 'yang', 'yang@123', '$2b$10$t6Z/pKP5Fk8RZZJycXo7ee6oFTUTknvRebPHtIRBpIy1K8UuX/J5i', '42/71 Herdsman parade', 'wembley', 'WA', '6014', 'Australia', '/images/default-avatar.png');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `star_rating` decimal(2,1) NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  `review_text` text NOT NULL,
  `upvotes` int(11) DEFAULT 0,
  `downvotes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`review_id`),
  KEY `idx_product_reviews` (`product_id`),
  KEY `idx_user_reviews` (`user_id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`user_id`, `product_id`, `star_rating`, `review_text`, `upvotes`, `downvotes`) VALUES
(2, 1, 5.0, 'Absolutely beautiful traditional wear! The quality is exceptional and the craftsmanship is outstanding. Highly recommend!', 3, 0),
(3, 1, 4.0, 'Great product, fits well and looks elegant. The fabric quality is good but could be slightly better for the price.', 2, 0),
(4, 2, 4.5, 'Love this piece! Perfect for special occasions. The colors are vibrant and true to the photos.', 1, 0),
(2, 3, 3.5, 'Decent quality but took longer to arrive than expected. The product itself is nice though.', 1, 1),
(5, 4, 5.0, 'Stunning kira! The mixed pattern is gorgeous and the quality is top-notch. Worth every penny!', 4, 0),
(3, 5, 4.0, 'Good value for money. The stripes pattern is beautiful and the fit is comfortable.', 2, 0);

-- --------------------------------------------------------

--
-- Table structure for table `review_votes`
--

CREATE TABLE `review_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `vote_type` enum('upvote','downvote') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review_vote` (`review_id`, `user_id`),
  KEY `idx_review_votes_review` (`review_id`),
  KEY `idx_review_votes_user` (`user_id`),
  CONSTRAINT `fk_review_votes_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`review_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_votes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `product_id` int(11) NOT NULL,
    `image_url` varchar(255) NOT NULL,
    `alt_text` varchar(255) DEFAULT NULL,
    `sort_order` int(11) DEFAULT 0,
    `is_primary` boolean DEFAULT FALSE,
    `created_at` timestamp DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_product_images` (`product_id`, `sort_order`),
    CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`) VALUES
(1, '/productimage/p1.png', '7 Wrap Stripes - Front View', 0, TRUE),
(1, '/productimage/p1-alt1.png', '7 Wrap Stripes - Side View', 1, FALSE),
(2, '/productimage/p2.png', '5 Wrap Stripes - Front View', 0, TRUE),
(2, '/productimage/p2-alt1.png', '5 Wrap Stripes - Detail View', 1, FALSE),
(3, '/productimage/p3.png', '3 Wrap Stripes - Front View', 0, TRUE),
(4, '/productimage/p4.png', 'Mixed Pattern Kira - Front View', 0, TRUE),
(5, '/productimage/p5.png', '3 Wrap Stripes - Front View', 0, TRUE),
(6, '/productimage/p6.png', '3 Wrap Stripes Kira - Front View', 0, TRUE);

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL UNIQUE,
    `slug` varchar(100) NOT NULL UNIQUE,
    `description` text DEFAULT NULL,
    `image` varchar(255) DEFAULT NULL,
    `parent_id` int(11) DEFAULT NULL,
    `sort_order` int(11) DEFAULT 0,
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT current_timestamp(),
    `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_categories_slug` (`slug`),
    KEY `idx_categories_parent` (`parent_id`),
    CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`name`, `slug`, `description`, `sort_order`) VALUES
('Women', 'women', 'Traditional Bhutanese clothing for women including Kira and accessories', 1),
('Men', 'men', 'Traditional Bhutanese clothing for men including Gho and formal wear', 2),
('Accessories', 'accessories', 'Traditional Bhutanese accessories including scarves, belts, and jewelry', 3);

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
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

--
-- Table structure for table `chat_sessions`
--

CREATE TABLE `chat_sessions` (
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

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
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

--
-- Table structure for table `wishlist_notifications`
--

CREATE TABLE `wishlist_notifications` (
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

--
-- Table structure for table `product_tags`
--

CREATE TABLE `product_tags` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL UNIQUE,
    `slug` varchar(50) NOT NULL UNIQUE,
    `created_at` timestamp DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_tags`
--

INSERT INTO `product_tags` (`name`, `slug`) VALUES
('Traditional', 'traditional'),
('Handcrafted', 'handcrafted'),
('Premium', 'premium'),
('Silk', 'silk'),
('Cotton', 'cotton'),
('Formal', 'formal'),
('Casual', 'casual'),
('Wedding', 'wedding'),
('Festival', 'festival'),
('Everyday', 'everyday');

-- --------------------------------------------------------

--
-- Table structure for table `product_tag_relations`
--

CREATE TABLE `product_tag_relations` (
    `product_id` int(11) NOT NULL,
    `tag_id` int(11) NOT NULL,
    PRIMARY KEY (`product_id`, `tag_id`),
    CONSTRAINT `fk_product_tag_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_product_tag_tag` FOREIGN KEY (`tag_id`) REFERENCES `product_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter`
--
ALTER TABLE `newsletter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD INDEX `idx_products_category` (`category`),
  ADD INDEX `idx_products_price` (`price`),
  ADD INDEX `idx_products_rating` (`rating`),
  ADD INDEX `idx_products_stock` (`stock_quantity`),
  ADD INDEX `idx_products_active` (`is_active`),
  ADD INDEX `idx_products_featured` (`featured`),
  ADD FULLTEXT INDEX `idx_products_search` (`name`, `category`, `description`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `newsletter`
--
ALTER TABLE `newsletter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `review_votes`
--
ALTER TABLE `review_votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_tags`
--
ALTER TABLE `product_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Sample wishlist data for testing
--

INSERT INTO `wishlists` (`user_id`, `product_id`) VALUES
(2, 1),
(2, 4),
(2, 12),
(3, 2),
(3, 5),
(4, 1),
(4, 3),
(5, 4),
(5, 11),
(5, 12);

--
-- Sample chat sessions for testing
--

INSERT INTO `chat_sessions` (`user_id`, `session_id`, `is_active`) VALUES
(2, 'session_user2_001', TRUE),
(3, 'session_user3_001', TRUE),
(4, 'session_user4_001', FALSE);

--
-- Sample chat messages for testing
--

INSERT INTO `chat_messages` (`session_id`, `message_type`, `message_content`) VALUES
('session_user2_001', 'user', 'Hello, I need help finding traditional Bhutanese clothing for a wedding.'),
('session_user2_001', 'bot', 'Hello! I\'d be happy to help you find the perfect traditional Bhutanese clothing for a wedding. For weddings, I recommend our premium Kira collection for women or our formal Gho collection for men. What type of clothing are you looking for?'),
('session_user2_001', 'user', 'I need a Kira for the bride.'),
('session_user2_001', 'bot', 'Wonderful! For a bride, I recommend our "Kishuthara" (Product ID: 12) which is our premium silk Kira priced at Nu. 222,259. It\'s perfect for special occasions like weddings. Would you like to see more details about this or other bridal options?'),
('session_user3_001', 'user', 'What\'s the difference between 3-wrap and 5-wrap stripes?'),
('session_user3_001', 'bot', 'Great question! The difference is in the traditional weaving pattern:\n\n3-Wrap Stripes: Simpler pattern, more casual wear, typically priced around Nu. 5,000-5,500\n5-Wrap Stripes: More complex weaving, suitable for formal occasions, typically priced around Nu. 10,500-17,000\n\nBoth are beautiful traditional designs, but 5-wrap stripes are considered more formal and ceremonial.');

--
-- Additional product tag relations for better categorization
--

INSERT INTO `product_tag_relations` (`product_id`, `tag_id`) VALUES
(1, 1), (1, 4), (1, 6),  -- 7 Wrap Stripes: Traditional, Silk, Formal
(2, 1), (2, 7),          -- 5 Wrap Stripes: Traditional, Casual
(3, 1), (3, 5), (3, 10), -- 3 Wrap Stripes: Traditional, Cotton, Everyday
(4, 1), (4, 3), (4, 8),  -- Mixed Pattern Kira: Traditional, Premium, Wedding
(11, 1), (11, 4), (11, 3), (11, 8), -- Silk coffee colour: Traditional, Silk, Premium, Wedding
(12, 1), (12, 4), (12, 3), (12, 8), (12, 6), -- Kishuthara: Traditional, Silk, Premium, Wedding, Formal
(21, 1), (21, 2),        -- Traditional Bhutan Scarf: Traditional, Handcrafted
(22, 1), (22, 4), (22, 2), -- Floral Silk Rachu: Traditional, Silk, Handcrafted
(23, 1), (23, 7),        -- Minimal Stripe Belt: Traditional, Casual
(24, 1), (24, 6);        -- Royal Blue Belt: Traditional, Formal

--
-- Create indexes for better performance
--

CREATE INDEX `idx_wishlists_created_at` ON `wishlists` (`created_at`);
CREATE INDEX `idx_chat_sessions_updated_at` ON `chat_sessions` (`updated_at`);
CREATE INDEX `idx_chat_messages_created_at` ON `chat_messages` (`created_at`);
CREATE INDEX `idx_reviews_created_at` ON `reviews` (`created_at`);
CREATE INDEX `idx_products_date_uploaded` ON `products` (`date_uploaded`);
CREATE INDEX `idx_products_name` ON `products` (`name`);

--
-- Create views for common queries
--

CREATE VIEW `popular_products` AS
SELECT
    p.id,
    p.name,
    p.category,
    p.price,
    p.rating,
    p.image,
    COUNT(w.id) as wishlist_count,
    COUNT(r.review_id) as review_count
FROM products p
LEFT JOIN wishlists w ON p.id = w.product_id
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.category, p.price, p.rating, p.image
ORDER BY wishlist_count DESC, rating DESC;

CREATE VIEW `user_wishlist_summary` AS
SELECT
    u.id as user_id,
    u.name as user_name,
    u.email,
    COUNT(w.id) as total_wishlist_items,
    SUM(p.price) as total_wishlist_value,
    MAX(w.created_at) as last_wishlist_activity
FROM users u
LEFT JOIN wishlists w ON u.id = w.user_id
LEFT JOIN products p ON w.product_id = p.id
GROUP BY u.id, u.name, u.email;

--
-- Stored procedures for common operations
--

DELIMITER //

CREATE PROCEDURE GetUserWishlistWithDetails(IN user_id INT)
BEGIN
    SELECT
        w.id as wishlist_id,
        w.created_at as added_date,
        p.id,
        p.name,
        p.price,
        p.image,
        p.category,
        p.rating,
        p.stock_quantity,
        COALESCE(p.is_active, 1) as is_active,
        CASE
            WHEN p.stock_quantity > 0 THEN 'In Stock'
            ELSE 'Out of Stock'
        END as stock_status
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = user_id
    ORDER BY w.created_at DESC;
END //

CREATE PROCEDURE GetProductReviewsSummary(IN product_id INT)
BEGIN
    SELECT
        COUNT(*) as total_reviews,
        AVG(star_rating) as average_rating,
        SUM(CASE WHEN star_rating = 5 THEN 1 ELSE 0 END) as five_star_count,
        SUM(CASE WHEN star_rating = 4 THEN 1 ELSE 0 END) as four_star_count,
        SUM(CASE WHEN star_rating = 3 THEN 1 ELSE 0 END) as three_star_count,
        SUM(CASE WHEN star_rating = 2 THEN 1 ELSE 0 END) as two_star_count,
        SUM(CASE WHEN star_rating = 1 THEN 1 ELSE 0 END) as one_star_count
    FROM reviews
    WHERE product_id = product_id;
END //

DELIMITER ;

--
-- Triggers for maintaining data integrity
--

DELIMITER //

CREATE TRIGGER update_product_rating_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET rating = (
        SELECT AVG(star_rating)
        FROM reviews
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
END //

CREATE TRIGGER update_product_rating_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET rating = (
        SELECT AVG(star_rating)
        FROM reviews
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
END //

CREATE TRIGGER update_product_rating_after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET rating = COALESCE((
        SELECT AVG(star_rating)
        FROM reviews
        WHERE product_id = OLD.product_id
    ), 0.00)
    WHERE id = OLD.product_id;
END //

DELIMITER ;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
