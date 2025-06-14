// Script to run database migrations
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
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

// Function to run migration
async function runMigration(migrationFile) {
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      return false;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`🔄 Running migration: ${migrationFile}`);
    
    return new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) {
          console.error(`❌ Error running migration ${migrationFile}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Migration ${migrationFile} completed successfully`);
          resolve(results);
        }
      });
    });
  } catch (error) {
    console.error(`❌ Error reading migration file:`, error.message);
    return false;
  }
}

// Function to check if tables exist
async function checkTables() {
  const tables = ['wishlists', 'chat_sessions', 'chat_messages', 'wishlist_notifications'];
  
  for (const table of tables) {
    try {
      await new Promise((resolve, reject) => {
        db.query(`SHOW TABLES LIKE '${table}'`, (err, results) => {
          if (err) {
            reject(err);
          } else {
            if (results.length > 0) {
              console.log(`✅ Table '${table}' exists`);
            } else {
              console.log(`❌ Table '${table}' does not exist`);
            }
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error checking table ${table}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking existing tables...');
    await checkTables();
    
    console.log('\n🚀 Starting migration...');
    await runMigration('003_add_wishlist_and_chatbot.sql');
    
    console.log('\n🔍 Checking tables after migration...');
    await checkTables();
    
    console.log('\n✅ Migration process completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    db.end();
    process.exit(0);
  }
}

// Run the migration
main();
