import { resolve } from 'node:path';
import sqlite3, { Database } from 'sqlite3';

const dbPath = resolve(process.cwd(), 'database.db');

// Create a single database connection instance cached across the server lifecycle
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

export const fetchAll = async (db: Database, sql: string, params?: any) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

export const execute = async (db: Database, sql: string, params: any = []) => {
  if (params && params.length > 0) {
    return new Promise<void>((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
  return new Promise<void>((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};