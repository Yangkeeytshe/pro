// config/database.js
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

let dbConfig;

if (process.env.JAWSDB_URL) {
  // Production - Heroku with JawsDB
  const url = require('url');
  const dbUrl = url.parse(process.env.JAWSDB_URL);
  
  dbConfig = {
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.auth.split(':')[0],
    password: dbUrl.auth.split(':')[1],
    database: dbUrl.pathname.substring(1), // Remove leading slash
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // Development - Local MySQL
  dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to database");
  }
});

module.exports = db;