import pg from 'pg';

import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  hashPassword,
  verifyPassword,
} from './password.mjs';

const { Pool } = pg;

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const user = process.env.DB_USER || 'zenflow';
  const password = process.env.DB_PASSWORD || 'zenflow123';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME || 'zenflow';
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

const globalPoolKey = '__zenflowPgPool';
const globalInitKey = '__zenflowPgInitPromise';

export function getPool() {
  if (!globalThis[globalPoolKey]) {
    globalThis[globalPoolKey] = new Pool({
      connectionString: getConnectionString(),
      max: 10,
    });
  }

  return globalThis[globalPoolKey];
}

export async function query(sql, params = []) {
  await ensureDatabase();
  return getPool().query(sql, params);
}

async function tableExists(pool, tableName) {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName],
  );
  return result.rows[0]?.exists === true;
}

async function createTables() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'planning',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      stakeholder TEXT NOT NULL DEFAULT '',
      module TEXT NOT NULL DEFAULT '',
      requirement_type TEXT NOT NULL DEFAULT '',
      importance TEXT NOT NULL DEFAULT '',
      urgency TEXT NOT NULL DEFAULT '',
      dev_reply TEXT NOT NULL DEFAULT '',
      solution TEXT NOT NULL DEFAULT '',
      milestone TEXT NOT NULL DEFAULT '',
      result TEXT NOT NULL DEFAULT '',
      remark TEXT NOT NULL DEFAULT '',
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'draft',
      attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      priority TEXT NOT NULL DEFAULT 'medium',
      assignee TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bugs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      steps TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'high',
      severity TEXT NOT NULL DEFAULT 'major',
      status TEXT NOT NULL DEFAULT 'open',
      assignee TEXT NOT NULL DEFAULT '',
      attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function alterIdColumnToText(pool, tableName) {
  if (!(await tableExists(pool, tableName))) return;

  await pool.query(`ALTER TABLE ${tableName} ALTER COLUMN id DROP DEFAULT`);
  await pool.query(
    `ALTER TABLE ${tableName} ALTER COLUMN id TYPE TEXT USING id::TEXT`,
  );
}

async function migrateUsersTable(pool) {
  if (!(await tableExists(pool, 'users'))) return;

  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
  `);

  const legacyUsers = await pool.query(`
    SELECT id, password
    FROM users
    WHERE password_hash IS NULL AND password IS NOT NULL
  `);

  for (const user of legacyUsers.rows) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashPassword(user.password),
      user.id,
    ]);
  }

  await pool.query(`
    UPDATE users
    SET password_hash = $1
    WHERE username = $2 AND password_hash IS NULL
  `, [hashPassword(DEFAULT_ADMIN_PASSWORD), DEFAULT_ADMIN_USERNAME]);
  await pool.query('ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL');
  await alterIdColumnToText(pool, 'users');
}

async function dropLegacyForeignKeys(pool) {
  const result = await pool.query(`
    SELECT conrelid::regclass::text AS table_name, conname
    FROM pg_constraint
    WHERE contype = 'f' AND connamespace = 'public'::regnamespace
  `);

  for (const constraint of result.rows) {
    await pool.query(
      `ALTER TABLE ${constraint.table_name} DROP CONSTRAINT ${constraint.conname}`,
    );
  }
}

async function migrateLegacySchema() {
  const pool = getPool();

  await dropLegacyForeignKeys(pool);
  await migrateUsersTable(pool);

  if (await tableExists(pool, 'projects')) {
    await pool.query(`
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE projects ALTER COLUMN description SET DEFAULT '';
      ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'planning';
    `);
    await alterIdColumnToText(pool, 'projects');
  }

  if (await tableExists(pool, 'requirements')) {
    await pool.query(`
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS stakeholder TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS module TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS requirement_type TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS importance TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS dev_reply TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS solution TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS milestone TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS result TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS remark TEXT NOT NULL DEFAULT '';
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE requirements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE requirements ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
      ALTER TABLE requirements ALTER COLUMN priority SET DEFAULT 'medium';
      ALTER TABLE requirements ALTER COLUMN status SET DEFAULT 'draft';
    `);
    await alterIdColumnToText(pool, 'requirements');
  }

  if (await tableExists(pool, 'tasks')) {
    await pool.query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TEXT NOT NULL DEFAULT '';
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE tasks ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
      ALTER TABLE tasks ALTER COLUMN description SET DEFAULT '';
      ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium';
      ALTER TABLE tasks ALTER COLUMN assignee SET DEFAULT '';
      ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'todo';
    `);
    await alterIdColumnToText(pool, 'tasks');
  }

  if (await tableExists(pool, 'bugs')) {
    await pool.query(`
      ALTER TABLE bugs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      ALTER TABLE bugs ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
      ALTER TABLE bugs ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
      ALTER TABLE bugs ALTER COLUMN steps SET DEFAULT '';
      ALTER TABLE bugs ALTER COLUMN priority SET DEFAULT 'high';
      ALTER TABLE bugs ALTER COLUMN severity SET DEFAULT 'major';
      ALTER TABLE bugs ALTER COLUMN assignee SET DEFAULT '';
      ALTER TABLE bugs ALTER COLUMN status SET DEFAULT 'open';
    `);
    await alterIdColumnToText(pool, 'bugs');
  }
}

async function ensureDefaultAdmin() {
  const pool = getPool();
  const result = await pool.query(
    'SELECT id, password_hash FROM users WHERE username = $1 LIMIT 1',
    [DEFAULT_ADMIN_USERNAME],
  );

  if (result.rowCount === 0) {
    await pool.query(
      'INSERT INTO users (id, username, password_hash, role) VALUES ($1, $2, $3, $4)',
      [
        '1',
        DEFAULT_ADMIN_USERNAME,
        hashPassword(DEFAULT_ADMIN_PASSWORD),
        'admin',
      ],
    );
    return;
  }

  const admin = result.rows[0];
  if (verifyPassword('123456', admin.password_hash)) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashPassword(DEFAULT_ADMIN_PASSWORD),
      admin.id,
    ]);
  }
}

export async function ensureDatabase() {
  if (!globalThis[globalInitKey]) {
    globalThis[globalInitKey] = (async () => {
      await migrateLegacySchema();
      await createTables();
      await migrateLegacySchema();
      await ensureDefaultAdmin();
    })();
  }

  return globalThis[globalInitKey];
}
