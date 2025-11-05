import { promises as fs } from 'fs';
import path from 'path';
import type { DBShape } from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DB: DBShape = {
  users: [],
  memberships: [],
};

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function ensureDB() {
  await ensureDataDir();
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
  }
}

export async function readDB(): Promise<DBShape> {
  await ensureDB();
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const data = JSON.parse(raw) as DBShape;
    // sanity defaults
    return { users: data.users ?? [], memberships: data.memberships ?? [] };
  } catch {
    return { ...DEFAULT_DB };
  }
}

export async function writeDB(next: DBShape) {
  await ensureDB();
  const tmp = DB_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf-8');
  await fs.rename(tmp, DB_FILE);
}
