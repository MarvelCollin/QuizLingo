import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    email TEXT NOT NULL,
    attempted_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS login_attempts_email ON login_attempts(email, attempted_at)`,
  `CREATE TABLE IF NOT EXISTS word_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    level INTEGER NOT NULL,
    box INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    wrong INTEGER NOT NULL DEFAULT 0,
    due_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, word)
  )`,
  `CREATE INDEX IF NOT EXISTS word_progress_due ON word_progress(user_id, due_at)`,
  `CREATE TABLE IF NOT EXISTS practice_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    level INTEGER NOT NULL,
    total INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS practice_sessions_user ON practice_sessions(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS rate_events (
    kind TEXT NOT NULL,
    key TEXT NOT NULL,
    at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS rate_events_key ON rate_events(kind, key, at)`,
  `CREATE TABLE IF NOT EXISTS basics_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson TEXT NOT NULL,
    best INTEGER NOT NULL,
    attempts INTEGER NOT NULL,
    completed_at INTEGER,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, lesson)
  )`,
];

export const getDb = async (): Promise<Client> => {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL is not set');
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  schemaReady ??= client
    .batch(SCHEMA, 'write')
    .then(() => undefined)
    .catch((error) => {
      schemaReady = null;
      throw error;
    });
  await schemaReady;
  return client;
};
