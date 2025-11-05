"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDB = readDB;
exports.writeDB = writeDB;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(process.cwd(), '.data');
const DB_FILE = path_1.default.join(DATA_DIR, 'db.json');
const DEFAULT_DB = {
    users: [],
    memberships: [],
};
async function ensureDataDir() {
    try {
        await fs_1.promises.mkdir(DATA_DIR, { recursive: true });
    }
    catch { }
}
async function ensureDB() {
    await ensureDataDir();
    try {
        await fs_1.promises.access(DB_FILE);
    }
    catch {
        await fs_1.promises.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    }
}
async function readDB() {
    await ensureDB();
    try {
        const raw = await fs_1.promises.readFile(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        return { users: data.users ?? [], memberships: data.memberships ?? [] };
    }
    catch {
        return { ...DEFAULT_DB };
    }
}
async function writeDB(next) {
    await ensureDB();
    const tmp = DB_FILE + '.tmp';
    await fs_1.promises.writeFile(tmp, JSON.stringify(next, null, 2), 'utf-8');
    await fs_1.promises.rename(tmp, DB_FILE);
}
//# sourceMappingURL=db.js.map