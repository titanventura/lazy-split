import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'splits.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS splits (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    total_amount INTEGER NOT NULL,
    number_of_people INTEGER NOT NULL,
    per_person_amount INTEGER NOT NULL,
    creator_name TEXT NOT NULL,
    creator_upi_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    split_id TEXT NOT NULL,
    name TEXT NOT NULL,
    has_paid INTEGER DEFAULT 0,
    marked_paid_at TEXT,
    FOREIGN KEY (split_id) REFERENCES splits(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_participants_split ON participants(split_id);
`);

export default db;
