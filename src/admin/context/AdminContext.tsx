/**
 * AdminContext.tsx — v3
 * ─────────────────────────────────────────────────────────────────────────────
 * Contexto global del panel de administración de Syntesis.
 *
 * Cambios v3:
 *  - Hash de contraseñas migrado de djb2 a SHA-256 (Web Crypto API)
 *  - Login y CRUD de usuarios ahora son async para soportar el hash
 *  - Migración automática de hashes viejos al primer login
 *
 * Permisos disponibles:
 *  - "editor_artistas"   → CRUD artistas
 *  - "editor_eventos"    → CRUD eventos
 *  - "editor_fechas"     → CRUD fechas
 *  - "admin_bookings"    → Ver, cambiar estado y eliminar bookings
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export type Permission =
  | "editor_artistas"
  | "editor_eventos"
  | "editor_fechas"
  | "admin_bookings";

export const PERMISSION_LABELS: Record<Permission, string> = {
  editor_artistas: "Editor Artistas",
  editor_eventos:  "Editor Eventos",
  editor_fechas:   "Editor Fechas",
  admin_bookings:  "Administrador de Bookings",
};

export const ALL_PERMISSIONS: Permission[] = [
  "editor_artistas",
  "editor_eventos",
  "editor_fechas",
  "admin_bookings",
];

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  hashVersion: "djb2" | "sha256"; // para migración automática
  isSuperAdmin: boolean;
  permissions: Permission[];
  createdAt: string;
  lastAccess?: string;
}

export interface BookingRequest {
  id: string;
  artist: string;
  name: string;
  organizationName: string;
  promoterPage: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  receivedAt: string;
  status: "nuevo" | "leído" | "archivado";
}

export interface ActivityLog {
  id: string;
  username: string;
  action: string;
  section: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAVES DE LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  users:       "syntesis_admin_users",
  session:     "syntesis_admin_session",
  bookings:    "syntesis_booking_requests",
  artists:     "syntesis_artists",
  events:      "syntesis_events",
  dates:       "syntesis_dates",
  activityLog: "syntesis_activity_log",
  theme:       "syntesis_admin_theme",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE HASH
// ─────────────────────────────────────────────────────────────────────────────

/** SHA-256 usando Web Crypto API nativa del navegador */
async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/** Hash djb2 legacy — solo para migración de usuarios existentes */
function djb2Hash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPERADMIN POR DEFECTO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hash SHA-256 de "SYnt73**" precalculado para inicialización síncrona.
 * Si cambiás la contraseña del superadmin, se actualiza automáticamente.
 */
const SUPER_ADMIN_SHA256 = "9867aca35243ec1fd8770f1c5efd979384b5d88546282a103c7f39d327e91dfb";

function initUsers(): AdminUser[] {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  if (stored) {
    const users: AdminUser[] = JSON.parse(stored);
    return users.map(u => ({
      ...u,
      isSuperAdmin: u.isSuperAdmin ?? false,
      permissions: u.permissions ?? [],
      hashVersion: u.hashVersion ?? "djb2", // usuarios viejos = djb2
    }));
  }
  const users: AdminUser[] = [{
    id: "1",
    username: "superadmin",
    passwordHash: SUPER_ADMIN_SHA256,
    hashVersion: "sha256",
    isSuperAdmin: true,
    permissions: [],
    createdAt: new Date().toISOString(),
  }];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  return users;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPO DEL CONTEXTO
// ─────────────────────────────────────────────────────────────────────────────

interface AdminContextType {
  currentUser: AdminUser | null;
  users: AdminUser[];
  bookingRequests: BookingRequest[];
  activityLog: ActivityLog[];
  theme: "dark" | "light";

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleTheme: () => void;

  createUser: (data: { username: string; password: string; permissions: Permission[] }) => Promise<boolean>;
  updateUser: (id: string, data: { username?: string; password?: string; permissions?: Permission[] }) => Promise<boolean>;
  deleteUser: (id: string) => boolean;

  addBookingRequest: (data: Omit<BookingRequest, "id" | "receivedAt" | "status">) => void;
  updateBookingStatus: (id: string, status: BookingRequest["status"]) => void;
  deleteBooking: (id: string) => void;

  logAction: (action: string, section: string) => void;

  getStorage: <T>(key: keyof typeof STORAGE_KEYS) => T | null;
  setStorage: <T>(key: keyof typeof STORAGE_KEYS, data: T) => void;

  can: (permission: Permission) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.session);
    return s ? JSON.parse(s) : null;
  });

  const [users, setUsers] = useState<AdminUser[]>(initUsers);

  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.bookings);
    return s ? JSON.parse(s) : [];
  });

  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.activityLog);
    return s ? JSON.parse(s) : [];
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return (stored as "dark" | "light") ?? "dark";
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookingRequests)); }, [bookingRequests]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(activityLog)); }, [activityLog]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.theme, theme); }, [theme]);

  // ── Log ───────────────────────────────────────────────────────────────────

  function logAction(action: string, section: string) {
    if (!currentUser) return;
    const entry: ActivityLog = {
      id: Date.now().toString(),
      username: currentUser.username,
      action,
      section,
      timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => [entry, ...prev].slice(0, 200));
  }

  // ── Theme ─────────────────────────────────────────────────────────────────

  function toggleTheme() {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async function login(username: string, password: string): Promise<boolean> {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return false;

    let matches = false;

    if (user.hashVersion === "sha256") {
      const hash = await sha256(password);
      matches = hash === user.passwordHash;
    } else {
      // Usuario con hash legacy djb2 — verificar y migrar a sha256
      matches = djb2Hash(password) === user.passwordHash;
      if (matches) {
        const newHash = await sha256(password);
        setUsers(prev => prev.map(u =>
          u.id === user.id
            ? { ...u, passwordHash: newHash, hashVersion: "sha256" }
            : u
        ));
      }
    }

    if (!matches) return false;

    const updated = { ...user, lastAccess: new Date().toISOString(), hashVersion: "sha256" as const };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(updated));
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    return true;
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  // ── CRUD usuarios ─────────────────────────────────────────────────────────

  async function createUser(data: { username: string; password: string; permissions: Permission[] }): Promise<boolean> {
    if (users.length >= 5) return false;
    if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) return false;
    const hash = await sha256(data.password);
    const newUser: AdminUser = {
      id: Date.now().toString(),
      username: data.username,
      passwordHash: hash,
      hashVersion: "sha256",
      isSuperAdmin: false,
      permissions: data.permissions,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    logAction(`Creó usuario "${data.username}"`, "usuarios");
    return true;
  }

  async function updateUser(id: string, data: { username?: string; password?: string; permissions?: Permission[] }): Promise<boolean> {
    const hash = data.password ? await sha256(data.password) : undefined;
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const updated = { ...u };
      if (data.username) updated.username = data.username;
      if (hash) { updated.passwordHash = hash; updated.hashVersion = "sha256"; }
      if (data.permissions !== undefined && !u.isSuperAdmin) updated.permissions = data.permissions;
      return updated;
    }));
    logAction(`Editó usuario id:${id}`, "usuarios");
    return true;
  }

  function deleteUser(id: string): boolean {
    if (currentUser?.id === id) return false;
    const user = users.find(u => u.id === id);
    if (user?.isSuperAdmin) return false;
    setUsers(prev => prev.filter(u => u.id !== id));
    logAction(`Eliminó usuario "${user?.username}"`, "usuarios");
    return true;
  }

  // ── Bookings ──────────────────────────────────────────────────────────────

  function addBookingRequest(data: Omit<BookingRequest, "id" | "receivedAt" | "status">) {
    const req: BookingRequest = {
      ...data,
      id: Date.now().toString(),
      receivedAt: new Date().toISOString(),
      status: "nuevo",
    };
    setBookingRequests(prev => [req, ...prev]);
  }

  function updateBookingStatus(id: string, status: BookingRequest["status"]) {
    setBookingRequests(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    logAction(`Cambió estado de booking ${id} a "${status}"`, "bookings");
  }

  function deleteBooking(id: string) {
    setBookingRequests(prev => prev.filter(b => b.id !== id));
    logAction(`Eliminó booking ${id}`, "bookings");
  }

  // ── Storage genérico ──────────────────────────────────────────────────────

  function getStorage<T>(key: keyof typeof STORAGE_KEYS): T | null {
    const s = localStorage.getItem(STORAGE_KEYS[key]);
    return s ? JSON.parse(s) : null;
  }

  function setStorage<T>(key: keyof typeof STORAGE_KEYS, data: T) {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  }

  // ── Permisos ──────────────────────────────────────────────────────────────

  function can(permission: Permission): boolean {
    if (!currentUser) return false;
    if (currentUser.isSuperAdmin) return true;
    return currentUser.permissions.includes(permission);
  }

  return (
    <AdminContext.Provider value={{
      currentUser, users, bookingRequests, activityLog, theme,
      login, logout, toggleTheme,
      createUser, updateUser, deleteUser,
      addBookingRequest, updateBookingStatus, deleteBooking,
      logAction, getStorage, setStorage, can,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin debe usarse dentro de <AdminProvider>");
  return ctx;
}
