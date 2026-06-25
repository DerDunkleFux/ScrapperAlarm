import { resolve } from 'node:path';
import sqlite3 from 'sqlite3';

const dbPath = resolve(process.cwd(), 'database.sqlite');

// Create a single database connection instance cached across the server lifecycle
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});