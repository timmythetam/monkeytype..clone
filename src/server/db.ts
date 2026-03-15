import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS typing_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    wpm REAL NOT NULL,
    rawWpm REAL NOT NULL,
    accuracy REAL NOT NULL,
    errors INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    mode TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS typing_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    testId INTEGER NOT NULL,
    second INTEGER NOT NULL,
    wpm REAL NOT NULL,
    accuracy REAL NOT NULL,
    FOREIGN KEY (testId) REFERENCES typing_tests (id)
  );
`);

export default db;
