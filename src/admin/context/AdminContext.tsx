/**
 * AdminContext.tsx — v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Contexto global del panel de administración de Syntesis.
 *
 * Cambios v2:
 *  - Sistema de permisos cambiado de rol único a array de permisos (roles[])
 *  - Nuevo permiso: "admin_bookings" (Administrador de Bookings)
 *  - Superadmin no tiene roles editables — acceso total implícito
 *  - BookingDate actualizado para soportar múltiples artistas e imagen
 *
 * Permisos disponibles (checkboxes en gestión de usuarios):
 *  - "editor_artistas"   → CRUD artistas
 *  - "editor_eventos"    → CRUD eventos
 *  - "editor_fechas"     → CRUD fechas
 *  - "admin_bookings"    → Ver, cambiar estado y eliminar bookings
 *
 * El superadmin tiene isSuperAdmin: true y siempre pasa todos los can() checks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

/** Permisos individuales asignables a usuarios normales */
export type Permission =
  | "editor_artistas"
  | "editor_eventos"
  | "editor_fechas"
  | "admin_bookings";

/** Etiquetas legibles para cada permiso */
export const PERMISSION_LABELS: Record<Permission, string> = {
  editor_artistas: "Editor Artistas",
  editor_eventos:  "Editor Eventos",
  editor_fechas:   "Editor Fechas",
  admin_bookings:  "Administrador de Bookings",
};

/** Todos los permisos disponibles para iterar en checkboxes */
export const ALL_PERMISSIONS: Permission[] = [
  "editor_artistas",
  "editor_eventos",
  "editor_fechas",
  "admin_bookings",
];

/** Usuario del panel de administración */
export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  isSuperAdmin: boolean;    // true solo para el superadmin — no editable
  permissions: Permission[]; // Array de permisos (vacío para superadmin, no aplica)
  createdAt: string;
  lastAccess?: string;
}

/** Formulario de booking recibido desde el sitio público */
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

/** Entrada del log de actividad */
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
// HELPERS PRIVADOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hash djb2 para contraseñas.
 * ⚠️ No criptográficamente seguro — apto para localStorage/demo.
 *    Migrar a Supabase Auth en producción.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/** Superadmin inicial — credenciales a cambiar desde el panel */
const SUPER_ADMIN_DEFAULT: AdminUser = {
  id: "1",
  username: "superadmin",
  passwordHash: simpleHash("SYnt73**"),
  isSuperAdmin: true,
  permissions: [], // No aplica — el superadmin tiene acceso total implícito
  createdAt: new Date().toISOString(),
};

/** Inicializa usuarios desde localStorage o crea el superadmin por defecto */
function initUsers(): AdminUser[] {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  if (stored) {
    const users: AdminUser[] = JSON.parse(stored);
    // Migración: si los usuarios guardados no tienen el nuevo formato, los actualiza
    return users.map(u => ({
      ...u,
      isSuperAdmin: u.isSuperAdmin ?? false,
      permissions: u.permissions ?? [],
    }));
  }
  const users = [SUPER_ADMIN_DEFAULT];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  return users;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPO DEL CONTEXTO
// ─────────────────────────────────────────────────────────────────────────────

interface AdminContextType {
  // Estado
  currentUser: AdminUser | null;
  users: AdminUser[];
  bookingRequests: BookingRequest[];
  activityLog: ActivityLog[];
  theme: "dark" | "light";

  // Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;
  toggleTheme: () => void;

  // CRUD usuarios
  createUser: (data: { username: string; password: string; permissions: Permission[] }) => boolean;
  updateUser: (id: string, data: { username?: string; password?: string; permissions?: Permission[] }) => boolean;
  deleteUser: (id: string) => boolean;

  // Booking requests
  addBookingRequest: (data: Omit<BookingRequest, "id" | "receivedAt" | "status">) => void;
  updateBookingStatus: (id: string, status: BookingRequest["status"]) => void;
  deleteBooking: (id: string) => void;

  // Log
  logAction: (action: string, section: string) => void;

  // Storage genérico
  getStorage: <T>(key: keyof typeof STORAGE_KEYS) => T | null;
  setStorage: <T>(key: keyof typeof STORAGE_KEYS, data: T) => void;

  /**
   * Verifica si el usuario actual tiene acceso a una sección.
   * El superadmin siempre retorna { view: true, edit: true }.
   */
  can: (permission: Permission) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXTO Y PROVIDER
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

  // Sincroniza con localStorage automáticamente
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

  function login(username: string, password: string): boolean {
    const user = users.find(
      u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.passwordHash === simpleHash(password)
    );
    if (!user) return false;
    const updated = { ...user, lastAccess: new Date().toISOString() };
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

  function createUser(data: { username: string; password: string; permissions: Permission[] }): boolean {
    if (users.length >= 5) return false;
    if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase())) return false;
    const newUser: AdminUser = {
      id: Date.now().toString(),
      username: data.username,
      passwordHash: simpleHash(data.password),
      isSuperAdmin: false,
      permissions: data.permissions,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    logAction(`Creó usuario "${data.username}"`, "usuarios");
    return true;
  }

  function updateUser(id: string, data: { username?: string; password?: string; permissions?: Permission[] }): boolean {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const updated = { ...u };
      if (data.username)    updated.username    = data.username;
      if (data.password)    updated.passwordHash = simpleHash(data.password);
      // Solo actualiza permisos si el usuario no es superadmin
      if (data.permissions !== undefined && !u.isSuperAdmin) {
        updated.permissions = data.permissions;
      }
      return updated;
    }));
    logAction(`Editó usuario id:${id}`, "usuarios");
    return true;
  }

  function deleteUser(id: string): boolean {
    if (currentUser?.id === id) return false;
    const user = users.find(u => u.id === id);
    // No permite eliminar al superadmin
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

  /**
   * Verifica si el usuario actual tiene un permiso específico.
   * El superadmin siempre retorna true.
   */
  function can(permission: Permission): boolean {
    if (!currentUser) return false;
    if (currentUser.isSuperAdmin) return true;
    return currentUser.permissions.includes(permission);
  }

  // ─────────────────────────────────────────────────────────────────────────

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
