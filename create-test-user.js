// Create a test user with known credentials
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moms_art'
});

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  const testUser = {
    name: 'Test User',
    email: 'test@wishlist.com',
    password: 'test123'
  };
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Check if user already exists
    db.query('SELECT id FROM users WHERE email = ?', [testUser.email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return;
      }
      
      if (results.length > 0) {
        console.log('✅ Test user already exists with email:', testUser.email);
        console.log('📝 Credentials: email =', testUser.email, ', password =', testUser.password);
        db.end();
        return;
      }
      
      // Create new user
      const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(insertQuery, [testUser.name, testUser.email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return;
        }
        
        console.log('✅ Test user created successfully!');
        console.log('📝 Credentials:');
        console.log('   Email:', testUser.email);
        console.log('   Password:', testUser.password);
        console.log('   User ID:', result.insertId);
        
        db.end();
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
    db.end();
  }
}

createTestUser();
