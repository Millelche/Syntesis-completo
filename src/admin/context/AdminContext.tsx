/**
 * AdminContext.tsx — v5
 * ─────────────────────────────────────────────────────────────────────────────
 * Cambios v5:
 *  - Bookings migrados de localStorage a Supabase (tabla bookings)
 * Cambios v4:
 *  - Usuarios migrados de localStorage a Supabase (tabla admin_users)
 *  - Login, createUser, updateUser, deleteUser ahora consultan Supabase
 *  - La sesión activa sigue en localStorage (solo el usuario logueado)
 *  - activityLog y theme siguen en localStorage
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

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
  hashVersion: "djb2" | "sha256";
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

async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function djb2Hash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function rowToBooking(row: any): BookingRequest {
  return {
    id: row.id,
    artist: row.artist ?? "",
    name: row.name ?? "",
    organizationName: row.organization_name ?? "",
    promoterPage: row.promoter_page ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    city: row.city ?? "",
    message: row.message ?? "",
    receivedAt: row.received_at ?? row.created_at ?? new Date().toISOString(),
    status: (row.status ?? "nuevo") as BookingRequest["status"],
  };
}

function rowToUser(row: any): AdminUser {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    hashVersion: (row.hash_version ?? "sha256") as "djb2" | "sha256",
    isSuperAdmin: row.is_super_admin ?? false,
    permissions: row.permissions ?? [],
    createdAt: row.created_at ?? new Date().toISOString(),
    lastAccess: row.last_access ?? undefined,
  };
}

interface AdminContextType {
  currentUser: AdminUser | null;
  users: AdminUser[];
  bookingRequests: BookingRequest[];
  activityLog: ActivityLog[];
  theme: "dark" | "light";
  usersLoading: boolean;
  bookingsLoading: boolean;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleTheme: () => void;

  createUser: (data: { username: string; password: string; permissions: Permission[] }) => Promise<boolean>;
  updateUser: (id: string, data: { username?: string; password?: string; permissions?: Permission[] }) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;

  addBookingRequest: (data: Omit<BookingRequest, "id" | "receivedAt" | "status">) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingRequest["status"]) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  logAction: (action: string, section: string) => void;

  getStorage: <T>(key: keyof typeof STORAGE_KEYS) => T | null;
  setStorage: <T>(key: keyof typeof STORAGE_KEYS, data: T) => void;

  can: (permission: Permission) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.session);
    return s ? JSON.parse(s) : null;
  });

  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.activityLog);
    return s ? JSON.parse(s) : [];
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return (stored as "dark" | "light") ?? "dark";
  });

  // ── Carga usuarios desde Supabase ─────────────────────────────────────────
  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase.from("admin_users").select("*");
      if (!error && data && data.length > 0) {
        setUsers(data.map(rowToUser));
      }
      setUsersLoading(false);
    }
    loadUsers();
  }, []);

  useEffect(() => {
    async function loadBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setBookingRequests(data.map(rowToBooking));
      }
      setBookingsLoading(false);
    }
    loadBookings();
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(activityLog)); }, [activityLog]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.theme, theme); }, [theme]);

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

  function toggleTheme() {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function login(username: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .ilike("username", username)
      .single();

    if (error || !data) return false;

    const user = rowToUser(data);
    let matches = false;

    if (user.hashVersion === "sha256") {
      const hash = await sha256(password);
      matches = hash === user.passwordHash;
    } else {
      matches = djb2Hash(password) === user.passwordHash;
      if (matches) {
        const newHash = await sha256(password);
        await supabase.from("admin_users").update({
          password_hash: newHash,
          hash_version: "sha256",
        }).eq("id", user.id);
        user.passwordHash = newHash;
        user.hashVersion = "sha256";
      }
    }

    if (!matches) return false;

    const updated = { ...user, lastAccess: new Date().toISOString() };
    await supabase.from("admin_users").update({ last_access: updated.lastAccess }).eq("id", user.id);
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
    if (users.length >= 10) return false;
    const exists = users.find(u => u.username.toLowerCase() === data.username.toLowerCase());
    if (exists) return false;

    const hash = await sha256(data.password);
    const newRow = {
      id: Date.now().toString(),
      username: data.username,
      password_hash: hash,
      hash_version: "sha256",
      is_super_admin: false,
      permissions: data.permissions,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("admin_users").insert(newRow);
    if (error) { console.error("Error creando usuario:", error.message); return false; }

    setUsers(prev => [...prev, rowToUser(newRow)]);
    logAction(`Creó usuario "${data.username}"`, "usuarios");
    return true;
  }

  async function updateUser(id: string, data: { username?: string; password?: string; permissions?: Permission[] }): Promise<boolean> {
    const hash = data.password ? await sha256(data.password) : undefined;
    const updates: any = {};
    if (data.username) updates.username = data.username;
    if (hash) { updates.password_hash = hash; updates.hash_version = "sha256"; }
    const user = users.find(u => u.id === id);
    if (data.permissions !== undefined && !user?.isSuperAdmin) updates.permissions = data.permissions;

    const { error } = await supabase.from("admin_users").update(updates).eq("id", id);
    if (error) { console.error("Error actualizando usuario:", error.message); return false; }

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

  async function deleteUser(id: string): Promise<boolean> {
    if (currentUser?.id === id) return false;
    const user = users.find(u => u.id === id);
    if (user?.isSuperAdmin) return false;

    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) { console.error("Error eliminando usuario:", error.message); return false; }

    setUsers(prev => prev.filter(u => u.id !== id));
    logAction(`Eliminó usuario "${user?.username}"`, "usuarios");
    return true;
  }

  // ── Bookings ──────────────────────────────────────────────────────────────
  async function addBookingRequest(data: Omit<BookingRequest, "id" | "receivedAt" | "status">) {
    const id = Date.now().toString();
    const receivedAt = new Date().toISOString();
    const row = {
      id,
      artist: data.artist,
      name: data.name,
      organization_name: data.organizationName,
      promoter_page: data.promoterPage,
      email: data.email,
      phone: data.phone,
      city: data.city,
      message: data.message,
      status: "nuevo",
      created_at: receivedAt,
      received_at: receivedAt,
    };
    const { error } = await supabase.from("bookings").insert(row);
    if (error) { console.error("Error al guardar booking:", error.message); return; }
    setBookingRequests(prev => [{ ...data, id, receivedAt, status: "nuevo" }, ...prev]);
  }

  async function updateBookingStatus(id: string, status: BookingRequest["status"]) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { console.error("Error al actualizar booking:", error.message); return; }
    setBookingRequests(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    logAction(`Cambió estado de booking ${id} a "${status}"`, "bookings");
  }

  async function deleteBooking(id: string) {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) { console.error("Error al eliminar booking:", error.message); return; }
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

  function can(permission: Permission): boolean {
    if (!currentUser) return false;
    if (currentUser.isSuperAdmin) return true;
    return currentUser.permissions.includes(permission);
  }

  return (
    <AdminContext.Provider value={{
      currentUser, users, bookingRequests, activityLog, theme, usersLoading, bookingsLoading,
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
