/**
 * Users.tsx — v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestión de usuarios del panel. Solo accesible para superadmin.
 *
 * Cambios v2:
 *  - Permisos como checkboxes múltiples en lugar de selector único
 *  - Superadmin no tiene checkboxes — solo puede editar su contraseña
 *  - No se puede eliminar al superadmin
 *  - Soporte de tema oscuro/claro
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from "react";
import { useAdmin, Permission, ALL_PERMISSIONS, PERMISSION_LABELS } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import AdminLayout from "@/admin/components/AdminLayout";
import { Navigate } from "react-router-dom";

export default function Users() {
  const { users, currentUser, createUser, updateUser, deleteUser, theme } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  // Solo superadmin puede acceder
  if (!currentUser?.isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;

  const [modal, setModal]       = useState<null | "create" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<(typeof users)[0] | null>(null);
  const [form, setForm]         = useState({ username: "", password: "", permissions: [] as Permission[] });
  const [feedback, setFeedback] = useState("");

  const inp: React.CSSProperties = {
    width: "100%", backgroundColor: t.bgInput, border: `1px solid ${t.border}`,
    color: t.text, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontSize: 9, letterSpacing: "0.18em", color: t.textMuted,
    display: "block", marginBottom: 5, textTransform: "uppercase",
  };

  function openCreate() {
    setForm({ username: "", password: "", permissions: [] });
    setFeedback("");
    setModal("create");
  }

  function openEdit(u: (typeof users)[0]) {
    setSelected(u);
    setForm({ username: u.username, password: "", permissions: [...u.permissions] });
    setFeedback("");
    setModal("edit");
  }

  function openDelete(u: (typeof users)[0]) {
    setSelected(u);
    setFeedback("");
    setModal("delete");
  }

  /** Alterna un permiso en el array del formulario */
  function togglePermission(p: Permission) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter(x => x !== p)
        : [...f.permissions, p],
    }));
  }

  async function handleCreate() {
    if (!form.username || !form.password) { setFeedback("Completá usuario y contraseña"); return; }
    const ok = await createUser({ username: form.username, password: form.password, permissions: form.permissions });
    if (!ok) { setFeedback("El usuario ya existe o se alcanzó el límite de 10 usuarios"); return; }
    setModal(null);
  }

  async function handleEdit() {
    if (!selected) return;
    if (!form.username) { setFeedback("El nombre de usuario no puede estar vacío"); return; }
    const ok = await updateUser(selected.id, {
      username: form.username,
      ...(form.password ? { password: form.password } : {}),
      ...(!selected.isSuperAdmin ? { permissions: form.permissions } : {}),
    });
    if (!ok) { setFeedback("Error al actualizar el usuario"); return; }
    setModal(null);
  }

  async function handleDelete() {
    if (!selected) return;
    const ok = await deleteUser(selected.id);
    if (!ok) { setFeedback("No se puede eliminar este usuario"); return; }
    setModal(null);
  }

  // ── Componente de checkboxes de permisos ──────────────────────────────────

  function PermissionCheckboxes({ disabled = false }: { disabled?: boolean }) {
    return (
      <div>
        <label style={lbl}>Permisos</label>
        {disabled && (
          <div style={{ fontSize: 11, color: t.textFaint, fontStyle: "italic", marginBottom: 8 }}>
            El superadmin tiene acceso total — los permisos no son editables.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ALL_PERMISSIONS.map(p => (
            <label
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.4 : 1,
                fontSize: 12,
                color: t.text,
              }}
            >
              <input
                type="checkbox"
                checked={disabled ? true : form.permissions.includes(p)}
                onChange={() => !disabled && togglePermission(p)}
                disabled={disabled}
                style={{ width: 15, height: 15, cursor: disabled ? "default" : "pointer", accentColor: t.accent }}
              />
              <span>{PERMISSION_LABELS[p]}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div style={{ padding: "2.5rem" }}>

        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em", color: t.text, marginBottom: 4 }}>Usuarios</h1>
            <p style={{ fontSize: 11, color: t.textMuted }}>{users.length}/10 usuarios creados</p>
          </div>
          {users.length < 10 && (
            <button onClick={openCreate} style={{ backgroundColor: t.accent, color: t.accentText, padding: "9px 18px", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
              + Nuevo usuario
            </button>
          )}
        </div>

        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {users.map(u => (
            <div key={u.id} style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{u.username}</span>
                  {u.isSuperAdmin && (
                    <span style={{ fontSize: 8, letterSpacing: "0.1em", color: t.textFaint, border: `1px solid ${t.border}`, padding: "1px 7px" }}>
                      SUPER ADMIN
                    </span>
                  )}
                  {u.id === currentUser?.id && (
                    <span style={{ fontSize: 8, letterSpacing: "0.1em", color: t.textFaint, border: `1px solid ${t.border}`, padding: "1px 7px" }}>
                      TÚ
                    </span>
                  )}
                </div>
                {/* Permisos del usuario */}
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>
                  {u.isSuperAdmin
                    ? "Acceso total"
                    : u.permissions.length > 0
                    ? u.permissions.map(p => PERMISSION_LABELS[p]).join(" · ")
                    : "Sin permisos asignados"
                  }
                </div>
                <div style={{ fontSize: 10, color: t.textFaint, marginTop: 2 }}>
                  Creado: {new Date(u.createdAt).toLocaleDateString("es-AR")}
                  {u.lastAccess && ` · Último acceso: ${new Date(u.lastAccess).toLocaleString("es-AR")}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => openEdit(u)} style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: t.textMuted, background: "none", border: `1px solid ${t.border}`, padding: "5px 12px", cursor: "pointer" }}>
                  Editar
                </button>
                {/* No permite eliminar al superadmin ni a la propia cuenta */}
                {!u.isSuperAdmin && u.id !== currentUser?.id && (
                  <button onClick={() => openDelete(u)} style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: t.danger, background: "none", border: `1px solid ${t.dangerBorder}`, padding: "5px 12px", cursor: "pointer" }}>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal crear / editar ─────────────────────────────────────────── */}
      {(modal === "create" || modal === "edit") && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ backgroundColor: t.bgModal, border: `1px solid ${t.border}`, padding: "2rem", width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: t.text, marginBottom: "1.75rem" }}>
              {modal === "create" ? "CREAR USUARIO" : `EDITAR — ${selected?.username}`}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={lbl}>Usuario</label>
                <input style={inp} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>{modal === "edit" ? "Nueva contraseña (vacío para no cambiar)" : "Contraseña"}</label>
                <input type="password" style={inp} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>

              {/* Checkboxes de permisos — deshabilitados para superadmin */}
              <PermissionCheckboxes disabled={selected?.isSuperAdmin === true} />

              {feedback && <div style={{ fontSize: 11, color: t.danger }}>{feedback}</div>}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={modal === "create" ? handleCreate : handleEdit} style={{ flex: 1, backgroundColor: t.accent, color: t.accentText, padding: "9px", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
                  {modal === "create" ? "Crear usuario" : "Guardar cambios"}
                </button>
                <button onClick={() => setModal(null)} style={{ flex: 1, backgroundColor: "transparent", color: t.textMuted, padding: "9px", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${t.border}`, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal eliminar ───────────────────────────────────────────────── */}
      {modal === "delete" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: t.bgModal, border: `1px solid ${t.border}`, padding: "2rem", width: "100%", maxWidth: 380, textAlign: "center" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 8 }}>¿Eliminar usuario?</h2>
            <p style={{ fontSize: 12, color: t.textMuted, marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Se eliminará el acceso de <strong style={{ color: t.text }}>{selected?.username}</strong> al panel.
            </p>
            {feedback && <div style={{ fontSize: 11, color: t.danger, marginBottom: 12 }}>{feedback}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleDelete} style={{ flex: 1, backgroundColor: t.dangerBg, color: t.danger, padding: "9px", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${t.dangerBorder}`, cursor: "pointer" }}>Eliminar</button>
              <button onClick={() => setModal(null)} style={{ flex: 1, backgroundColor: "transparent", color: t.textMuted, padding: "9px", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${t.border}`, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
