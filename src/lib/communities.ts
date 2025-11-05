// Local membership storage for communities
import { COMMUNITIES, type Community } from "@/data/communities";

export type CommunityMembership = {
  userId: string;
  slug: string; // community slug
  joinedAt: string; // ISO
};

const MEMBERS_KEY = "pp.community_memberships";

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
  try { window.dispatchEvent(new CustomEvent("pp:auth")); } catch {}
}

export function listMemberships(): CommunityMembership[] {
  return readJSON<CommunityMembership[]>(MEMBERS_KEY, []);
}

export function saveMemberships(list: CommunityMembership[]) {
  writeJSON(MEMBERS_KEY, list);
}

export function getUserMemberships(userId: string): CommunityMembership[] {
  return listMemberships().filter(m => m.userId === userId);
}

export function getUserCommunities(userId: string): Community[] {
  const slugs = new Set(getUserMemberships(userId).map(m => m.slug));
  return COMMUNITIES.filter(c => slugs.has(c.slug));
}

export function isMember(userId: string, slug: string): boolean {
  return listMemberships().some(m => m.userId === userId && m.slug === slug);
}

export function joinCommunity(userId: string, slug: string) {
  if (!userId || !slug) return { ok: false as const, error: "Parâmetros inválidos" };
  const all = listMemberships();
  if (all.some(m => m.userId === userId && m.slug === slug)) return { ok: true as const };
  all.push({ userId, slug, joinedAt: new Date().toISOString() });
  saveMemberships(all);
  return { ok: true as const };
}

export function leaveCommunity(userId: string, slug: string) {
  const all = listMemberships();
  const next = all.filter(m => !(m.userId === userId && m.slug === slug));
  saveMemberships(next);
  return { ok: true as const };
}
