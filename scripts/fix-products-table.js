// Script to check and fix products table structure
const mysql = require('mysql2');
require('dotenv').config();

// Create database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to the MySQL database.');
});

// Function to check table structure
async function checkTableStructure() {
  return new Promise((resolve, reject) => {
    db.query('DESCRIBE products', (err, results) => {
      if (err) {
        reject(err);
      } else {
        console.log('📋 Current products table structure:');
        results.forEach(column => {
          console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
        });
        
        // Check if is_active column exists
        const hasIsActive = results.some(column => column.Field === 'is_active');
        resolve(hasIsActive);
      }
    });
  });
}

// Function to add missing columns
async function addMissingColumns() {
  const alterQueries = [
    { name: 'is_active', query: "ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE" },
    { name: 'featured', query: "ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT FALSE" },
    { name: 'meta_title', query: "ALTER TABLE products ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL" },
    { name: 'meta_description', query: "ALTER TABLE products ADD COLUMN meta_description TEXT DEFAULT NULL" },
    { name: 'updated_at', query: "ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
  ];

  for (const queryObj of alterQueries) {
    try {
      await new Promise((resolve, reject) => {
        db.query(queryObj.query, (err, result) => {
          if (err) {
            // Ignore "duplicate column" errors
            if (err.code === 'ER_DUP_FIELDNAME') {
              console.log(`⚠️  Column already exists: ${queryObj.name}`);
              resolve(result);
            } else {
              reject(err);
            }
          } else {
            console.log(`✅ Added column: ${queryObj.name}`);
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error adding column ${queryObj.name}:`, error.message);
    }
  }
}

// Function to update existing products to have is_active = TRUE
async function updateExistingProducts() {
  return new Promise((resolve, reject) => {
    db.query('UPDATE products SET is_active = TRUE WHERE is_active IS NULL', (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ Updated ${result.affectedRows} products to set is_active = TRUE`);
        resolve(result);
      }
    });
  });
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking products table structure...');
    const hasIsActive = await checkTableStructure();
    
    if (!hasIsActive) {
      console.log('\n🔧 Adding missing columns...');
      await addMissingColumns();
      
      console.log('\n🔄 Updating existing products...');
      await updateExistingProducts();
      
      console.log('\n🔍 Checking updated table structure...');
      await checkTableStructure();
    } else {
      console.log('\n✅ Products table already has is_active column');
    }
    
    console.log('\n✅ Products table fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    db.end();
    process.exit(0);
  }
}

// Run the fix
main();
