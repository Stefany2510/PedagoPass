// Client-side storage for reservations and orders tied to the authenticated user.
import { DESTINOS } from "@/data/destinations";

export type ReservationStatus = "pendente" | "confirmada" | "cancelada";

export type Reservation = {
  id: string;
  userId: string;
  destinoSlug: string;
  destinoNome: string;
  destinoImagem?: string;
  createdAt: string; // ISO
  ida: string; // ISO Date (yyyy-mm-dd)
  volta: string; // ISO Date (yyyy-mm-dd)
  pessoas: number; // 1 + acompanhantes
  formaPagamento?: string;
  totalEstimado: number; // baseado no preco* pessoas
  status: ReservationStatus;
};

export type Order = {
  id: string;
  userId: string;
  reservationId?: string;
  destinoSlug: string;
  destinoNome: string;
  total: number;
  metodo: string;
  parcelas?: number;
  pagoEm: string; // ISO
};

const RESERVATIONS_KEY = "pp.reservations";
const ORDERS_KEY = "pp.orders";

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
  // notify listeners (reusing auth channel for simplicity)
  try {
    window.dispatchEvent(new CustomEvent("pp:auth"));
  } catch {}
}

export function listReservations(): Reservation[] {
  return readJSON<Reservation[]>(RESERVATIONS_KEY, []);
}

export function saveReservations(list: Reservation[]) {
  writeJSON(RESERVATIONS_KEY, list);
}

export function listOrders(): Order[] {
  return readJSON<Order[]>(ORDERS_KEY, []);
}

export function saveOrders(list: Order[]) {
  writeJSON(ORDERS_KEY, list);
}

export function getUserReservations(userId: string): Reservation[] {
  return listReservations()
    .filter(r => r.userId === userId)
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserOrders(userId: string): Order[] {
  return listOrders()
    .filter(o => o.userId === userId)
    .sort((a,b) => b.pagoEm.localeCompare(a.pagoEm));
}

export function getOrderById(id: string): Order | null {
  return listOrders().find(o => o.id === id) ?? null;
}

export function getOrderByReservationId(reservationId: string): Order | null {
  return listOrders().find(o => o.reservationId === reservationId) ?? null;
}

export function addReservation(params: {
  userId: string;
  destinoSlug: string;
  ida: string;
  volta: string;
  pessoas: number; // total de pessoas
  formaPagamento?: string;
}): { ok: true; reservation: Reservation } | { ok: false; error: string } {
  const { userId, destinoSlug, ida, volta, pessoas, formaPagamento } = params;
  if (!userId) return { ok: false, error: "Usuário inválido" };
  const d = DESTINOS.find(x => x.slug === destinoSlug);
  if (!d) return { ok: false, error: "Destino não encontrado" };
  const totalEstimado = Math.max(1, Math.floor(pessoas || 1)) * (d.preco || 0);
  const r: Reservation = {
    id: `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`,
    userId,
    destinoSlug,
    destinoNome: d.nome,
    destinoImagem: d.imagem,
    createdAt: new Date().toISOString(),
    ida,
    volta,
    pessoas: Math.max(1, Math.floor(pessoas || 1)),
    formaPagamento,
    totalEstimado,
    status: "pendente",
  };
  const list = listReservations();
  list.push(r);
  saveReservations(list);
  return { ok: true, reservation: r };
}

export function updateReservationStatus(reservationId: string, status: ReservationStatus) {
  const list = listReservations();
  const idx = list.findIndex(r => r.id === reservationId);
  if (idx === -1) return { ok: false as const, error: "Reserva não encontrada" };
  list[idx] = { ...list[idx], status };
  saveReservations(list);
  return { ok: true as const };
}

export function getReservationById(id: string): Reservation | null {
  return listReservations().find(r => r.id === id) ?? null;
}

export function markReservationPaid(params: {
  reservationId: string;
  metodo: string;
  parcelas?: number;
}): { ok: true; order: Order } | { ok: false; error: string } {
  const { reservationId, metodo, parcelas } = params;
  const reservations = listReservations();
  const r = reservations.find(x => x.id === reservationId);
  if (!r) return { ok: false, error: "Reserva não encontrada" };
  // create order
  const order: Order = {
    id: `o_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`,
    userId: r.userId,
    reservationId: r.id,
    destinoSlug: r.destinoSlug,
    destinoNome: r.destinoNome,
    total: r.totalEstimado,
    metodo,
    parcelas,
    pagoEm: new Date().toISOString(),
  };
  const orders = listOrders();
  orders.push(order);
  saveOrders(orders);
  // also mark reservation as confirmada
  updateReservationStatus(r.id, "confirmada");
  return { ok: true, order };
}
