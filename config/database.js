const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

let db;

if (process.env.JAWSDB_URL) {
  // ✅ Production - Heroku with JawsDB
  const dbUrl = new URL(process.env.JAWSDB_URL);

  db = mysql.createConnection({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    port: 3306,
    ssl: {
      rejectUnauthorized: true
    }
  });
} else {
  // ✅ Development - Local .env settings
  db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'moms_art',
    port: process.env.DB_PORT || 3306
  });
}

module.exports = db;
