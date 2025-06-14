const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

let db;

if (process.env.JAWSDB_URL) {
  // ✅ Production - JawsDB on Heroku
  const dbUrl = new URL(process.env.JAWSDB_URL);

  db = mysql.createConnection({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    port: 3306,
    ssl: {
      // ✅ Fix for "self-signed certificate" error
      rejectUnauthorized: false
    }
  });
} else {
  // ✅ Development - Local DB
  db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'moms_art',
    port: process.env.DB_PORT || 3306
  });
}

module.exports = db;
