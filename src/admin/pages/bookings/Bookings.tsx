/**
 * Bookings.tsx — v2
 * Gestión de bookings recibidos. Accesible para superadmin y admin_bookings.
 * Soporte de tema oscuro/claro.
 */
import { useState } from "react";
import { useAdmin, BookingRequest } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import AdminLayout from "@/admin/components/AdminLayout";
import { Navigate } from "react-router-dom";

const STATUS_LABELS: Record<BookingRequest["status"], string> = {
  nuevo: "Nuevo", "leído": "Leído", archivado: "Archivado",
};

export default function Bookings() {
  const { bookingRequests, updateBookingStatus, deleteBooking, can, currentUser, theme } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  // Acceso: superadmin o admin_bookings
  const hasAccess = currentUser?.isSuperAdmin || can("admin_bookings");
  if (!hasAccess) return <Navigate to="/admin/dashboard" replace />;

  const [filter, setFilter]     = useState<"todos" | BookingRequest["status"]>("todos");
  const [selected, setSelected] = useState<BookingRequest | null>(null);

  const filtered = bookingRequests.filter(b => filter === "todos" || b.status === filter);

  const counts = {
    todos:     bookingRequests.length,
    nuevo:     bookingRequests.filter(b => b.status === "nuevo").length,
    "leído":   bookingRequests.filter(b => b.status === "leído").length,
    archivado: bookingRequests.filter(b => b.status === "archivado").length,
  };

  function openDetail(b: BookingRequest) {
    setSelected(b);
    if (b.status === "nuevo") updateBookingStatus(b.id, "leído");
  }

  function changeStatus(id: string, status: BookingRequest["status"]) {
    updateBookingStatus(id, status);
    setSelected(prev => prev ? { ...prev, status } : null);
  }

  return (
    <AdminLayout>
      <div style={{ padding: "2.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em", color: t.text, marginBottom: 4 }}>Bookings Recibidos</h1>
          <p style={{ fontSize: 11, color: t.textMuted }}>{counts.nuevo} nuevos · {bookingRequests.length} totales</p>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {(["todos", "nuevo", "leído", "archivado"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 14px", cursor: "pointer",
              border: `1px solid ${t.border}`,
              backgroundColor: filter === f ? t.accent : "transparent",
              color: filter === f ? t.accentText : t.textMuted,
              transition: "all 0.15s",
            }}>
              {STATUS_LABELS[f as BookingRequest["status"]] ?? "Todos"} {counts[f] > 0 && `(${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        {filtered.length === 0
          ? <div style={{ textAlign: "center", padding: "4rem", color: t.textFaint, fontSize: 13 }}>No hay bookings en esta categoría.</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filtered.map(b => (
                <div key={b.id} onClick={() => openDetail(b)} style={{
                  backgroundColor: b.status === "nuevo" ? t.bgActive : t.bgCard,
                  border: `1px solid ${t.border}`,
                  padding: "1rem 1.5rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "border-color 0.15s",
                }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = t.borderStrong)}
                  onMouseOut={e => (e.currentTarget.style.borderColor = t.border)}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{b.artist}</span>
                      {b.status === "nuevo" && (
                        <span style={{ fontSize: 8, backgroundColor: t.badgeBg, color: t.badgeText, padding: "1px 7px", fontWeight: 700, letterSpacing: "0.1em" }}>NUEVO</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                      {b.name}{b.organizationName && ` · ${b.organizationName}`} · {b.city}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: t.textFaint, textAlign: "right" }}>
                    <div>{new Date(b.receivedAt).toLocaleDateString("es-AR")}</div>
                    <div style={{ marginTop: 2 }}>{b.email}</div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Modal detalle */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: t.bgModal, border: `1px solid ${t.border}`, padding: "2rem", width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{selected.artist}</h2>
                <div style={{ fontSize: 10, color: t.textFaint, marginTop: 2 }}>
                  Recibido: {new Date(selected.receivedAt).toLocaleString("es-AR")}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ fontSize: 18, color: t.textMuted, background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              {[
                ["Nombre",        selected.name],
                ["Organización",  selected.organizationName || "—"],
                ["Email",         selected.email],
                ["Teléfono",      selected.phone || "—"],
                ["Web / Redes",   selected.promoterPage || "—"],
                ["Ciudad / País", selected.city],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", color: t.textFaint, marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 13, color: t.text }}>{value}</div>
                </div>
              ))}
            </div>

            {selected.message && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.15em", color: t.textFaint, marginBottom: 6, textTransform: "uppercase" }}>Detalles del evento</div>
                <div style={{ fontSize: 13, color: t.text, backgroundColor: t.bgCard, padding: "1rem", lineHeight: 1.7, border: `1px solid ${t.border}` }}>
                  {selected.message}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.12em", marginRight: 4 }}>ESTADO:</span>
              {(["nuevo", "leído", "archivado"] as const).map(s => (
                <button key={s} onClick={() => changeStatus(selected.id, s)} style={{
                  fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 14px", cursor: "pointer",
                  border: `1px solid ${t.border}`,
                  backgroundColor: selected.status === s ? t.accent : "transparent",
                  color: selected.status === s ? t.accentText : t.textMuted,
                  transition: "all 0.15s",
                }}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
              {/* Eliminar: superadmin y admin_bookings */}
              <button onClick={() => { deleteBooking(selected.id); setSelected(null); }} style={{
                marginLeft: "auto", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "6px 14px", cursor: "pointer", border: `1px solid ${t.dangerBorder}`,
                backgroundColor: "transparent", color: t.danger,
              }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
