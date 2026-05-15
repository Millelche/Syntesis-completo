/**
 * Login.tsx — v2
 * Pantalla de login del panel admin con soporte de tema oscuro/claro.
 */
import { useState, useEffect } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, currentUser, theme, toggleTheme } = useAdmin();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const t = theme === "dark" ? darkTheme : lightTheme;

  // Si ya hay sesión activa, redirige al dashboard
  useEffect(() => {
    if (currentUser) navigate("/admin/dashboard", { replace: true });
  }, [currentUser, navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Delay mínimo para no revelar si el usuario existe por tiempo de respuesta
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        navigate("/admin/dashboard");
      } else {
        setError("Usuario o contraseña incorrectos");
      }
      setLoading(false);
    }, 400);
  }

  const inp: React.CSSProperties = {
    width: "100%",
    backgroundColor: t.bgInput,
    border: `1px solid ${t.border}`,
    color: t.text,
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const lbl: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: "0.2em",
    color: t.textMuted,
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: theme === "dark" ? "#030903" : "#F0EFEF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "DM Sans, sans-serif",
      transition: "background-color 0.2s",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        padding: "2.5rem",
        backgroundColor: t.bgModal,
        border: `1px solid ${t.border}`,
        position: "relative",
      }}>

        {/* Toggle theme — esquina superior derecha */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 14,
            background: "none",
            border: "none",
            cursor: "pointer",
            opacity: 0.5,
            transition: "opacity 0.15s",
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = "1")}
          onMouseOut={e => (e.currentTarget.style.opacity = "0.5")}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Logo y título */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <svg viewBox="0 0 1788 895" xmlns="http://www.w3.org/2000/svg" style={{ width: 48, height: 24, marginBottom: 16 }}>
            <polygon fill={t.text} points="1788,180 1788,0 178,0 178,178 0,178 0,358 178,358 178,537 1608,537 1608,714 0,714 0,894 1431,894 1609,894 1609,716 1788,716 1788,536 1609,536 1609,357 180,357 180,180"/>
          </svg>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.25em", color: t.text }}>SYNTESIS</div>
          <div style={{ fontSize: 9, color: t.textFaint, letterSpacing: "0.2em", marginTop: 4 }}>ADMIN PANEL</div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={lbl}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={inp}
              disabled={loading}
              onFocus={e => (e.currentTarget.style.borderColor = t.borderStrong)}
              onBlur={e => (e.currentTarget.style.borderColor = t.border)}
            />
          </div>

          <div>
            <label style={lbl}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inp}
              disabled={loading}
              onFocus={e => (e.currentTarget.style.borderColor = t.borderStrong)}
              onBlur={e => (e.currentTarget.style.borderColor = t.border)}
            />
          </div>

          {error && (
            <div style={{
              fontSize: 11,
              color: t.danger,
              textAlign: "center",
              padding: "7px",
              backgroundColor: t.dangerBg,
              border: `1px solid ${t.dangerBorder}`,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: t.accent,
              color: t.accentText,
              padding: "11px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "0.5rem",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
