import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sqlite3 from 'sqlite3'; 

export default defineNitroPlugin((nitroApp : any) => {
  
  const dbPath = resolve(process.cwd(), 'database.db');

  console.log(`[Server Startup] Checking database at: ${dbPath}`);

  if (!existsSync(dbPath)) {
    console.log('[Server Startup] database.db not found. Creating a new one...');
    
    // 1. Create an empty file to establish its existence
    writeFileSync(dbPath, '');

    // 2. Open the database connection and initialize the structure
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[Server Startup] Failed to connect to new SQLite DB:', err.message);
        return;
      }
      
      // 3. Serialize your DDL queries to build your table structure safely
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS alarms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            name TEXT NOT NULL,
            start TEXT,
            end TEXT,
            startDate TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
          )
        `, (err) => {
          if (err) {
            console.error('[Server Startup] Error creating structure:', err.message);
          } else {
            console.log('[Server Startup] SQLite database structure created successfully.');
          }
          
          // Close initialization handle
          db.close();
        });
      });
    });
  } else {
    console.log('[Server Startup] database.db already exists. Skipping initialization.');
  }
});