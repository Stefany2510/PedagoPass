// Simple client-side auth using localStorage. Not for production use.
export type StoredUser = {
  id: string;
  nome: string;
  email: string;
  passwordHash: string;
  createdAt: string; // ISO
};

const USERS_KEY = "pp.users";
const SESSION_KEY = "pp.session"; // stores userId
const LAST_USER_KEY = "pp.last_user"; // stores last userId for quick access

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): StoredUser[] {
  return readJSON<StoredUser[]>(USERS_KEY, []);
}

export function saveUsers(users: StoredUser[]) {
  writeJSON(USERS_KEY, users);
}

export function getSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionUserId(userId: string | null) {
  if (typeof window === "undefined") return;
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
  // notify listeners
  try {
    window.dispatchEvent(new CustomEvent("pp:auth"));
  } catch {}
}

function getLastUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_USER_KEY);
}

function setLastUserId(userId: string | null) {
  if (typeof window === "undefined") return;
  if (userId) localStorage.setItem(LAST_USER_KEY, userId);
  else localStorage.removeItem(LAST_USER_KEY);
}

export function getCurrentUser(): StoredUser | null {
  const id = getSessionUserId();
  if (!id) return null;
  const users = getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export function getLastUser(): StoredUser | null {
  const id = getLastUserId();
  if (!id) return null;
  const users = getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export function onAuthChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener("pp:auth", handler as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("pp:auth", handler as EventListener);
  };
}

export function isEmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

async function sha256Hex(input: string): Promise<string> {
  try {
    // browser subtle crypto
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // very weak fallback; demo only
    return btoa(input).split("").reverse().join("");
  }
}

export async function createUser(params: {
  nome: string;
  email: string;
  senha: string;
}): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const { nome, email, senha } = params;
  if (!nome.trim()) return { ok: false, error: "Informe seu nome." };
  if (!isEmailValid(email)) return { ok: false, error: "E-mail inválido." };
  if (senha.length < 6) return { ok: false, error: "A senha deve ter ao menos 6 caracteres." };

  const users = getUsers();
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return { ok: false, error: "Já existe uma conta com este e-mail." };

  const passwordHash = await sha256Hex(senha);
  const user: StoredUser = {
    id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    nome: nome.trim(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  setLastUserId(user.id);
  setSessionUserId(user.id);
  return { ok: true, user };
}

export async function login(params: {
  email: string;
  senha: string;
}): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const { email, senha } = params;
  if (!isEmailValid(email)) return { ok: false, error: "E-mail inválido." };
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: "Conta não encontrada." };
  const hash = await sha256Hex(senha);
  if (user.passwordHash !== hash) return { ok: false, error: "Senha incorreta." };
  setLastUserId(user.id);
  setSessionUserId(user.id);
  return { ok: true, user };
}

export function logout() {
  const current = getSessionUserId();
  if (current) setLastUserId(current);
  setSessionUserId(null);
}

export async function changePassword(params: {
  userId: string;
  current: string;
  next: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId, current, next } = params;
  if (next.length < 6) return { ok: false, error: "A nova senha deve ter ao menos 6 caracteres." };
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { ok: false, error: "Usuário não encontrado." };
  const user = users[idx];
  const currentHash = await sha256Hex(current);
  if (user.passwordHash !== currentHash) return { ok: false, error: "Senha atual incorreta." };
  const nextHash = await sha256Hex(next);
  users[idx] = { ...user, passwordHash: nextHash };
  saveUsers(users);
  return { ok: true };
}

export function quickLogin(): { ok: true; user: StoredUser } | { ok: false; error: string } {
  const last = getLastUser();
  if (!last) return { ok: false, error: "Nenhum usuário recente encontrado." };
  setSessionUserId(last.id);
  return { ok: true, user: last };
}
