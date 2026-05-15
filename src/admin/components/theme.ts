/**
 * theme.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tokens de color para el panel de administración en modo oscuro y claro.
 *
 * Uso:
 *   import { useTheme } from "@/admin/components/theme";
 *   const t = useTheme();
 *   <div style={{ backgroundColor: t.bg, color: t.text }}>...</div>
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ThemeTokens {
  // Fondos
  bg:         string; // Fondo principal del contenido
  bgSidebar:  string; // Fondo del sidebar
  bgCard:     string; // Fondo de cards y filas
  bgInput:    string; // Fondo de inputs
  bgModal:    string; // Fondo de modales
  bgHover:    string; // Fondo al hacer hover
  bgActive:   string; // Fondo del ítem activo del nav

  // Bordes
  border:     string; // Borde general
  borderStrong: string; // Borde resaltado

  // Textos
  text:       string; // Texto principal
  textMuted:  string; // Texto secundario
  textFaint:  string; // Texto terciario

  // Acento (siempre el logo color)
  accent:     string; // Color de acento (botones primarios)
  accentText: string; // Texto sobre acento

  // Danger
  danger:     string;
  dangerBg:   string;
  dangerBorder: string;

  // Success
  success:    string;

  // Badge "nuevo"
  badgeBg:    string;
  badgeText:  string;
}

export const darkTheme: ThemeTokens = {
  bg:           "#0a0a0a",
  bgSidebar:    "#0d0d0d",
  bgCard:       "#141414",
  bgInput:      "#1a1a1a",
  bgModal:      "#0d0d0d",
  bgHover:      "rgba(218,216,216,0.04)",
  bgActive:     "rgba(218,216,216,0.07)",

  border:       "rgba(218,216,216,0.08)",
  borderStrong: "rgba(218,216,216,0.25)",

  text:         "#F0EFEF",
  textMuted:    "rgba(240,239,239,0.55)",
  textFaint:    "rgba(240,239,239,0.3)",

  accent:       "#DAD8D8",
  accentText:   "#030903",

  danger:       "#f87171",
  dangerBg:     "rgba(248,113,113,0.1)",
  dangerBorder: "rgba(248,113,113,0.25)",

  success:      "#6ee7b7",

  badgeBg:      "#DAD8D8",
  badgeText:    "#030903",
};

export const lightTheme: ThemeTokens = {
  bg:           "#F5F4F4",
  bgSidebar:    "#ECEAEA",
  bgCard:       "#FFFFFF",
  bgInput:      "#F0EFEF",
  bgModal:      "#FFFFFF",
  bgHover:      "rgba(3,9,3,0.03)",
  bgActive:     "rgba(3,9,3,0.07)",

  border:       "rgba(3,9,3,0.1)",
  borderStrong: "rgba(3,9,3,0.3)",

  text:         "#0d0d0d",
  textMuted:    "rgba(13,13,13,0.55)",
  textFaint:    "rgba(13,13,13,0.35)",

  accent:       "#030903",
  accentText:   "#DAD8D8",

  danger:       "#dc2626",
  dangerBg:     "rgba(220,38,38,0.08)",
  dangerBorder: "rgba(220,38,38,0.25)",

  success:      "#059669",

  badgeBg:      "#030903",
  badgeText:    "#DAD8D8",
};
