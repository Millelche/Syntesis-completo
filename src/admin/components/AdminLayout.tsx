/**
 * AdminLayout.tsx — v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout principal del panel con soporte de tema oscuro/claro.
 *
 * Cambios v2:
 *  - Tokens de color centralizados (darkTheme / lightTheme)
 *  - Toggle dark/light mode en el footer del sidebar
 *  - Mejor contraste: texto principal #F0EFEF sobre fondos oscuros
 *  - Lógica de permisos actualizada para el nuevo sistema de permissions[]
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useAdmin, PERMISSION_LABELS } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import { useNavigate, Link, useLocation } from "react-router-dom";

// ── Definición de la navegación ───────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",       path: "/admin/dashboard", permission: null               },
  { label: "Artistas",        path: "/admin/artists",   permission: "editor_artistas"  },
  { label: "Eventos",         path: "/admin/events",    permission: "editor_eventos"   },
  { label: "Próximas Fechas", path: "/admin/dates",     permission: "editor_fechas"    },
  { label: "Bookings",        path: "/admin/bookings",  permission: "admin_bookings"   },
  { label: "Usuarios",        path: "/admin/users",     permission: "superadmin_only"  },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, can, bookingRequests, theme, toggleTheme } = useAdmin();
  const navigate   = useNavigate();
  const location   = useLocation();
  const t          = theme === "dark" ? darkTheme : lightTheme;

  // Bookings sin leer para el badge del sidebar
  const newBookings = bookingRequests.filter(b => b.status === "nuevo").length;

  function handleLogout() {
    logout();
    navigate("/admin");
  }

  // ── Render de cada ítem del nav ───────────────────────────────────────────

  function renderNavItem(item: typeof NAV_ITEMS[number]) {
    // Determina visibilidad según el permiso del ítem
    const isVisible =
      item.permission === null
        ? true
        : item.permission === "superadmin_only"
        ? currentUser?.isSuperAdmin === true
        : currentUser?.isSuperAdmin || can(item.permission as any);

    if (!isVisible) return null;

    const isActive = location.pathname.startsWith(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0.6rem 1.5rem",
          fontSize: 12,
          letterSpacing: "0.06em",
          textDecoration: "none",
          color: isActive ? t.text : t.textMuted,
          backgroundColor: isActive ? t.bgActive : "transparent",
          borderLeft: `2px solid ${isActive ? t.text : "transparent"}`,
          transition: "all 0.15s",
          fontWeight: isActive ? 600 : 400,
        }}
        onMouseOver={e => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = t.bgHover;
            e.currentTarget.style.color = t.text;
          }
        }}
        onMouseOut={e => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = t.textMuted;
          }
        }}
      >
        <span style={{ fontSize: 5, opacity: 0.7, flexShrink: 0 }}>⬛</span>
        <span>{item.label}</span>

        {/* Badge de bookings nuevos */}
        {item.permission === "admin_bookings" && newBookings > 0 && (
          <span style={{
            marginLeft: "auto",
            backgroundColor: t.badgeBg,
            color: t.badgeText,
            borderRadius: 10,
            fontSize: 9,
            fontWeight: 700,
            padding: "1px 7px",
          }}>
            {newBookings}
          </span>
        )}
      </Link>
    );
  }

  // ── Etiqueta de permisos del usuario actual ───────────────────────────────

  function getUserRoleLabel(): string {
    if (!currentUser) return "";
    if (currentUser.isSuperAdmin) return "Super Admin";
    if (currentUser.permissions.length === 0) return "Sin permisos";
    return currentUser.permissions
      .map(p => PERMISSION_LABELS[p])
      .join(" · ");
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: "flex",
      height: "100vh",          // Altura fija — el scroll es interno
      overflow: "hidden",       // Evita scroll en el contenedor raíz
      backgroundColor: t.bg,
      color: t.text,
      fontFamily: "DM Sans, sans-serif",
      transition: "background-color 0.2s, color 0.2s",
    }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 230,
        height: "100vh",        // Altura fija igual a la ventana
        position: "sticky",     // Se queda fijo mientras el contenido scrollea
        top: 0,
        backgroundColor: t.bgSidebar,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto",      // Scroll propio si el contenido del sidebar no entra
        transition: "background-color 0.2s",
      }}>

        {/* Logo y título */}
        <div style={{
          padding: "1.5rem",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <svg viewBox="0 0 1788 895" xmlns="http://www.w3.org/2000/svg" style={{ width: 28, height: 14, flexShrink: 0 }}>
            <polygon fill={t.text} points="1788,180 1788,0 178,0 178,178 0,178 0,358 178,358 178,537 1608,537 1608,714 0,714 0,894 1431,894 1609,894 1609,716 1788,716 1788,536 1609,536 1609,357 180,357 180,180"/>
          </svg>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: t.text }}>SYNTESIS</div>
            <div style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.15em", marginTop: 1 }}>ADMIN PANEL</div>
          </div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, paddingTop: "0.75rem" }}>
          {NAV_ITEMS.map(renderNavItem)}
        </nav>

        {/* Footer del sidebar: usuario + toggle theme + logout */}
        <div style={{
          padding: "1rem 1.5rem",
          borderTop: `1px solid ${t.border}`,
        }}>
          {/* Info del usuario */}
          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 2 }}>
              {currentUser?.username}
            </div>
            <div style={{
              fontSize: 9,
              color: t.textFaint,
              letterSpacing: "0.06em",
              lineHeight: 1.5,
              maxWidth: 170,
              wordBreak: "break-word",
            }}>
              {getUserRoleLabel()}
            </div>
          </div>

          {/* Toggle dark/light mode */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              marginBottom: 8,
              fontSize: 10,
              letterSpacing: "0.1em",
              color: t.textMuted,
              backgroundColor: t.bgCard,
              border: `1px solid ${t.border}`,
              cursor: "pointer",
              transition: "all 0.15s",
              textAlign: "left",
            }}
            onMouseOver={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.borderColor = t.borderStrong; }}
            onMouseOut={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; }}
          >
            <span style={{ fontSize: 14 }}>{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
          </button>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: t.textFaint,
              background: "none",
              border: `1px solid ${t.border}`,
              padding: "6px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.borderColor = t.borderStrong; }}
            onMouseOut={e => { e.currentTarget.style.color = t.textFaint; e.currentTarget.style.borderColor = t.border; }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: "auto", height: "100vh", transition: "background-color 0.2s" }}>
        {children}
      </main>
    </div>
  );
}
