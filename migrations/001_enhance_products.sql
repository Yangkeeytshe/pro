-- Migration 001: Enhance Products Table for Multiple Images and Better Structure
-- Run this migration to add support for multiple product images and improved product data

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN images JSON AFTER image,
ADD COLUMN thumbnail VARCHAR(255) AFTER images,
ADD COLUMN alt_text VARCHAR(255) AFTER thumbnail,
ADD COLUMN stock_quantity INT DEFAULT 0 AFTER alt_text,
ADD COLUMN low_stock_threshold INT DEFAULT 5 AFTER stock_quantity,
ADD COLUMN track_inventory BOOLEAN DEFAULT TRUE AFTER low_stock_threshold,
ADD COLUMN description TEXT AFTER track_inventory,
ADD COLUMN short_description VARCHAR(500) AFTER description,
ADD COLUMN sku VARCHAR(100) UNIQUE AFTER short_description,
ADD COLUMN weight DECIMAL(8,2) AFTER sku,
ADD COLUMN dimensions VARCHAR(100) AFTER weight,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER dimensions,
ADD COLUMN featured BOOLEAN DEFAULT FALSE AFTER is_active,
ADD COLUMN meta_title VARCHAR(255) AFTER featured,
ADD COLUMN meta_description TEXT AFTER meta_title,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER meta_description;

-- Update existing products to have image arrays
UPDATE products 
SET images = JSON_ARRAY(image),
    thumbnail = image,
    alt_text = CONCAT(name, ' - Traditional Bhutanese Clothing'),
    stock_quantity = FLOOR(RAND() * 50) + 10,
    description = CONCAT('Beautiful traditional Bhutanese ', category, ' clothing. Handcrafted with attention to detail and authentic design.'),
    short_description = CONCAT('Traditional Bhutanese ', category, ' - Premium Quality'),
    sku = CONCAT('MA-', LPAD(id, 4, '0')),
    weight = CASE 
        WHEN category = 'Accessories' THEN ROUND(RAND() * 0.5 + 0.1, 2)
        ELSE ROUND(RAND() * 2 + 0.5, 2)
    END,
    dimensions = CASE 
        WHEN category = 'Accessories' THEN '20x15x5 cm'
        WHEN category = 'Men' THEN '120x80x10 cm'
        ELSE '110x75x8 cm'
    END,
    is_active = TRUE,
    featured = CASE WHEN id <= 6 THEN TRUE ELSE FALSE END,
    meta_title = CONCAT(name, ' - Traditional Bhutanese ', category, ' | Mom\'s Art'),
    meta_description = CONCAT('Shop authentic ', name, ' traditional Bhutanese ', category, ' clothing at Mom\'s Art. Premium quality, handcrafted designs.')
WHERE images IS NULL;

-- Add indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE FULLTEXT INDEX idx_products_search ON products(name, category, description);

-- Create product_images table for additional images
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images (product_id, sort_order)
);

-- Insert some additional sample images for featured products
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, '/productimage/p1.png', '7 Wrap Stripes - Front View', 0, TRUE),
(1, '/productimage/p1-alt1.png', '7 Wrap Stripes - Side View', 1, FALSE),
(2, '/productimage/p2.png', '5 Wrap Stripes - Front View', 0, TRUE),
(2, '/productimage/p2-alt1.png', '5 Wrap Stripes - Detail View', 1, FALSE),
(3, '/productimage/p3.png', '3 Wrap Stripes - Front View', 0, TRUE),
(4, '/productimage/p4.png', 'Mixed Pattern Kira - Front View', 0, TRUE),
(5, '/productimage/p5.png', '3 Wrap Stripes - Front View', 0, TRUE),
(6, '/productimage/p6.png', '3 Wrap Stripes Kira - Front View', 0, TRUE);

-- Create product_categories table for better category management
CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    parent_id INT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_categories_slug (slug),
    INDEX idx_categories_parent (parent_id)
);

-- Insert default categories
INSERT INTO product_categories (name, slug, description, sort_order) VALUES
('Women', 'women', 'Traditional Bhutanese clothing for women including Kira and accessories', 1),
('Men', 'men', 'Traditional Bhutanese clothing for men including Gho and formal wear', 2),
('Accessories', 'accessories', 'Traditional Bhutanese accessories including scarves, belts, and jewelry', 3);

-- Create product_tags table for better product organization
CREATE TABLE product_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_tag_relations table
CREATE TABLE product_tag_relations (
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES product_tags(id) ON DELETE CASCADE
);

-- Insert some sample tags
INSERT INTO product_tags (name, slug) VALUES
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

-- Add some tags to products
INSERT INTO product_tag_relations (product_id, tag_id) 
SELECT p.id, t.id 
FROM products p 
CROSS JOIN product_tags t 
WHERE (p.id <= 12 AND t.name IN ('Traditional', 'Handcrafted', 'Premium'))
   OR (p.name LIKE '%Silk%' AND t.name = 'Silk')
   OR (p.name LIKE '%Cotton%' AND t.name = 'Cotton');

-- Migration completed successfully
SELECT 'Migration 001 completed successfully' as status;
