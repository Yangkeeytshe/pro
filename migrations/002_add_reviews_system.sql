-- Migration: Add Reviews System
-- This migration adds the reviews and review_votes tables needed for the product review functionality

-- Create reviews table
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

-- Create review_votes table to track user votes on reviews
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

-- Add some sample reviews for testing
INSERT INTO `reviews` (`user_id`, `product_id`, `star_rating`, `review_text`, `upvotes`, `downvotes`) VALUES
(2, 1, 5.0, 'Absolutely beautiful traditional wear! The quality is exceptional and the craftsmanship is outstanding. Highly recommend!', 3, 0),
(3, 1, 4.0, 'Great product, fits well and looks elegant. The fabric quality is good but could be slightly better for the price.', 2, 0),
(4, 2, 4.5, 'Love this piece! Perfect for special occasions. The colors are vibrant and true to the photos.', 1, 0),
(2, 3, 3.5, 'Decent quality but took longer to arrive than expected. The product itself is nice though.', 1, 1),
(5, 4, 5.0, 'Stunning kira! The mixed pattern is gorgeous and the quality is top-notch. Worth every penny!', 4, 0),
(3, 5, 4.0, 'Good value for money. The stripes pattern is beautiful and the fit is comfortable.', 2, 0);

-- Add profilePic column to users table if it doesn't exist (for review display)
ALTER TABLE `users` ADD COLUMN `profilePic` varchar(255) DEFAULT '/images/default-avatar.png';

-- Update existing users with default profile pictures
UPDATE `users` SET `profilePic` = '/images/default-avatar.png' WHERE `profilePic` IS NULL;
