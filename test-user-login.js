// Test user login with different credentials
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

async function testUserCredentials() {
  console.log('🔍 Testing user credentials...\n');
  
  // Get all users
  db.query('SELECT id, name, email, password FROM users LIMIT 5', async (err, users) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }
    
    console.log('Available test users:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });
    
    console.log('\n🧪 Testing password verification...');
    
    // Test common passwords
    const testPasswords = ['123', 'password', '1234', 'test', 'admin'];
    
    for (const user of users.slice(0, 3)) { // Test first 3 users
      console.log(`\nTesting user: ${user.name} (${user.email})`);
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log(`✅ Password found: "${testPassword}" for ${user.email}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}":`, error.message);
        }
      }
    }
    
    db.end();
  });
}

testUserCredentials();
