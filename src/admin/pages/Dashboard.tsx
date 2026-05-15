/**
 * Dashboard.tsx — v2
 * Panel principal con soporte de tema y nuevo sistema de permisos.
 */
import { useAdmin, PERMISSION_LABELS } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import AdminLayout from "@/admin/components/AdminLayout";
import { artists as defaultArtists, events as defaultEvents, Artist, Event } from "@/data/mockData";
import { Link } from "react-router-dom";

function StatCard({ label, value, link, highlight, t }: {
  label: string; value: number | string; link: string;
  highlight?: boolean; t: ReturnType<typeof darkTheme extends never ? never : typeof darkTheme>;
}) {
  return (
    <Link to={link} style={{ textDecoration: "none" }}>
      <div
        style={{
          backgroundColor: t.bgCard,
          border: `1px solid ${highlight ? t.borderStrong : t.border}`,
          padding: "1.5rem",
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
        onMouseOver={e => (e.currentTarget.style.borderColor = t.borderStrong)}
        onMouseOut={e => (e.currentTarget.style.borderColor = highlight ? t.borderStrong : t.border)}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: t.text, marginBottom: 6 }}>{value}</div>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", color: t.textMuted, textTransform: "uppercase" }}>{label}</div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { currentUser, bookingRequests, users, activityLog, getStorage, theme, can } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  const storedArtists = getStorage<Artist[]>("artists");
  const storedEvents  = getStorage<Event[]>("events");
  const artists = storedArtists ?? defaultArtists;
  const events  = storedEvents  ?? defaultEvents;

  const newBookings = bookingRequests.filter(b => b.status === "nuevo").length;
  const nextEvents  = events.filter(e => !e.isPast).length;

  return (
    <AdminLayout>
      <div style={{ padding: "2.5rem" }}>

        {/* Encabezado */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em", color: t.text, marginBottom: 4 }}>
            Bienvenido, {currentUser?.username}
          </h1>
          <p style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.06em" }}>
            {currentUser?.isSuperAdmin
              ? "Super Admin"
              : currentUser?.permissions.map(p => PERMISSION_LABELS[p]).join(" · ") || "Sin permisos"
            }
            {" · "}
            {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard label="Artistas en el roster" value={artists.length}  link="/admin/artists"  t={t} />
          <StatCard label="Eventos totales"        value={events.length}   link="/admin/events"   t={t} />
          <StatCard label="Próximos eventos"       value={nextEvents}      link="/admin/events"   t={t} />
          <StatCard label="Bookings nuevos"        value={newBookings}     link="/admin/bookings" t={t} highlight={newBookings > 0} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

          {/* Actividad reciente */}
          <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, padding: "1.5rem" }}>
            <h2 style={{ fontSize: 9, letterSpacing: "0.18em", color: t.textMuted, textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Actividad reciente
            </h2>
            {activityLog.length === 0
              ? <p style={{ fontSize: 12, color: t.textFaint }}>Sin actividad registrada aún.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {activityLog.slice(0, 8).map(log => (
                    <div key={log.id} style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: "0.65rem" }}>
                      <div style={{ fontSize: 12, color: t.text }}>{log.action}</div>
                      <div style={{ fontSize: 10, color: t.textFaint, marginTop: 2 }}>
                        {log.username} · {new Date(log.timestamp).toLocaleString("es-AR")}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Bookings recientes */}
          <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: 9, letterSpacing: "0.18em", color: t.textMuted, textTransform: "uppercase" }}>Bookings recientes</h2>
              <Link to="/admin/bookings" style={{ fontSize: 9, color: t.textFaint, textDecoration: "none" }}>Ver todos →</Link>
            </div>
            {bookingRequests.length === 0
              ? <p style={{ fontSize: 12, color: t.textFaint }}>No hay bookings recibidos aún.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {bookingRequests.slice(0, 5).map(b => (
                    <div key={b.id} style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: "0.65rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>{b.artist}</div>
                          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>{b.name} · {b.city}</div>
                        </div>
                        <span style={{
                          fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px",
                          border: `1px solid ${t.border}`,
                          backgroundColor: b.status === "nuevo" ? t.badgeBg : "transparent",
                          color: b.status === "nuevo" ? t.badgeText : t.textMuted,
                        }}>
                          {b.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: t.textFaint, marginTop: 2 }}>
                        {new Date(b.receivedAt).toLocaleDateString("es-AR")}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* Usuarios — solo superadmin */}
        {currentUser?.isSuperAdmin && (
          <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: 9, letterSpacing: "0.18em", color: t.textMuted, textTransform: "uppercase" }}>
                Usuarios del panel ({users.length}/5)
              </h2>
              <Link to="/admin/users" style={{ fontSize: 9, color: t.textFaint, textDecoration: "none" }}>Administrar →</Link>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {users.map(u => (
                <div key={u.id} style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{u.username}</div>
                  <div style={{ fontSize: 9, color: t.textFaint, marginTop: 2 }}>
                    {u.isSuperAdmin ? "Super Admin" : u.permissions.map(p => PERMISSION_LABELS[p]).join(", ") || "Sin permisos"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
