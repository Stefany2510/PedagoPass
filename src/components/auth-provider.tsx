"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Community } from "../lib/api";
import { apiLogin, apiLogout, apiMe, apiSignup, apiMyCommunities, apiJoinCommunity, apiLeaveCommunity, apiGetCommunities, apiCreateQuickToken, apiQuickLogin } from "../lib/api";

type StoredUser = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
};

type AuthContextValue = {
  user: StoredUser | null;
  loading: boolean;
  memberships: Community[];
  avatarUrl: string | null;
  login: (email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (nome: string, email: string, senha: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  joinCommunity: (slug: string) => { ok: boolean; error?: string };
  leaveCommunity: (slug: string) => { ok: boolean; error?: string };
  refreshMemberships: () => void;
  quickLoginWithToken: (token: string) => Promise<{ ok: boolean; error?: string }>;
  updateAvatar: (dataUrl: string) => void;
  clearAvatar: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Community[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const mapSlugsToCommunities = React.useCallback(async (slugs: string[]): Promise<Community[]> => {
    const set = new Set(slugs);
    try {
      const all = await apiGetCommunities();
      return all.filter(c => set.has(c.slug));
    } catch {
      return [];
    }
  }, []);

  const loadAvatar = React.useCallback((nextUser: StoredUser | null) => {
    if (!nextUser) {
      setAvatarUrl(null);
      return;
    }
    try {
      const stored = localStorage.getItem(`pp.avatar.${nextUser.id}`);
      setAvatarUrl(stored ?? null);
    } catch {
      setAvatarUrl(null);
    }
  }, []);

  const syncMemberships = React.useCallback(async (nextUser: StoredUser | null) => {
    if (!nextUser) { setMemberships([]); return; }
    const slugs = await apiMyCommunities();
    const list = await mapSlugsToCommunities(slugs);
    setMemberships(list);
  }, [mapSlugsToCommunities]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await apiMe();
      if (cancelled) return;
      setUser(me);
      await syncMemberships(me);
      loadAvatar(me);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [syncMemberships, loadAvatar]);

  useEffect(() => {
    loadAvatar(user);
  }, [user, loadAvatar]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    memberships,
    avatarUrl,
    async login(email, senha) {
      try {
        const u = await apiLogin({ email, senha });
        setUser(u);
        await syncMemberships(u);
        loadAvatar(u);
        try {
          localStorage.setItem('pp.lastEmail', u.email);
          localStorage.setItem('pp.lastNome', u.nome);
        } catch {}
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.data?.error || e?.message || 'Falha ao entrar' };
      }
    },
    async signup(nome, email, senha) {
      try {
        const u = await apiSignup({ nome, email, senha });
        setUser(u);
        await syncMemberships(u);
        loadAvatar(u);
        try {
          localStorage.setItem('pp.lastEmail', u.email);
          localStorage.setItem('pp.lastNome', u.nome);
        } catch {}
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e?.data?.error || e?.message || 'Falha ao cadastrar' };
      }
    },
    logout() {
      // antes de limpar o token, tenta gerar um quick-token (5min) para relogar em 1 clique
      (async () => {
        const qt = await apiCreateQuickToken();
        if (qt) {
          try {
            localStorage.setItem('pp.quickToken', qt.token);
            localStorage.setItem('pp.quickTokenExp', qt.expiresAt);
          } catch {}
        }
        apiLogout();
      })();
      setUser(null);
      setMemberships([]);
      setAvatarUrl(null);
    },
    async quickLoginWithToken(token) {
      try {
        const u = await apiQuickLogin(token);
        if (!u) {
          try {
            localStorage.removeItem('pp.quickToken');
            localStorage.removeItem('pp.quickTokenExp');
          } catch {}
          return { ok: false as const, error: 'Token inválido ou expirado.' };
        }
        setUser(u);
        await syncMemberships(u);
        loadAvatar(u);
        try {
          localStorage.setItem('pp.lastEmail', u.email);
          localStorage.setItem('pp.lastNome', u.nome);
          localStorage.removeItem('pp.quickToken');
          localStorage.removeItem('pp.quickTokenExp');
        } catch {}
        return { ok: true as const };
      } catch (e: any) {
        try {
          localStorage.removeItem('pp.quickToken');
          localStorage.removeItem('pp.quickTokenExp');
        } catch {}
        return { ok: false as const, error: e?.data?.error || e?.message || 'Falha ao restaurar sessão.' };
      }
    },
    joinCommunity(slug) {
      if (!user) return { ok: false as const, error: "É necessário estar logado." };
      try {
        apiJoinCommunity(slug);
        syncMemberships(user);
        return { ok: true as const };
      } catch (e: any) {
        return { ok: false as const, error: e?.data?.error || 'Falha ao participar' };
      }
    },
    leaveCommunity(slug) {
      if (!user) return { ok: false as const, error: "É necessário estar logado." };
      try {
        apiLeaveCommunity(slug);
        syncMemberships(user);
        return { ok: true as const };
      } catch (e: any) {
        return { ok: false as const, error: e?.data?.error || 'Falha ao sair' };
      }
    },
    refreshMemberships() {
      syncMemberships(user);
    },
    updateAvatar(dataUrl) {
      if (!user) return;
      try {
        localStorage.setItem(`pp.avatar.${user.id}`, dataUrl);
      } catch {}
      setAvatarUrl(dataUrl);
    },
    clearAvatar() {
      if (!user) return;
      try {
        localStorage.removeItem(`pp.avatar.${user.id}`);
      } catch {}
      setAvatarUrl(null);
    }
  }), [user, loading, memberships, avatarUrl, syncMemberships, loadAvatar]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
