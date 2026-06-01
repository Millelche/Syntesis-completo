/**
 * Events.tsx — v2
 * CRUD de eventos con soporte de tema oscuro/claro y permisos v2.
 */
import { useState } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import AdminLayout from "@/admin/components/AdminLayout";
import { Navigate } from "react-router-dom";
import { events as defaultEvents, Event } from "@/data/mockData";

function convertToWebP(file: File, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) { reject("Error"); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }, "image/webp", quality);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => reject("Error"); img.src = url;
  });
}

const EMPTY: Event = { id: "", name: "", slug: "", date: "", time: "", venue: "", city: "", flyer: "", description: "", lineup: [], isPast: false, setTimes: [], ticketLinks: [], recordedSets: "" };

export default function Events() {
  const { can, currentUser, getStorage, setStorage, logAction, theme } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  const hasView = currentUser?.isSuperAdmin || can("editor_eventos") || can("editor_artistas");
  if (!hasView) return <Navigate to="/admin/dashboard" replace />;
  const canEdit = currentUser?.isSuperAdmin || can("editor_eventos");

  const stored = getStorage<Event[]>("events");
  const [events, setEvents] = useState<Event[]>(stored ?? defaultEvents);
  const [modal, setModal] = useState<null | "create" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<Event | null>(null);
  const [form, setForm] = useState<Event>({ ...EMPTY });
  const [lineupText, setLineupText] = useState("");
  const [setTimesText, setSetTimesText] = useState("");
  const [tickets, setTickets] = useState<{ name: string; url: string }[]>([{ name: "", url: "" }]);
  const [converting, setConv] = useState(false);
  const [converted, setDone] = useState(false);

  const inp: React.CSSProperties = { width: "100%", backgroundColor: t.bgInput, border: `1px solid ${t.border}`, color: t.text, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl: React.CSSProperties = { fontSize: 9, letterSpacing: "0.18em", color: t.textMuted, display: "block", marginBottom: 5, textTransform: "uppercase" };

  function persist(updated: Event[]) { setEvents(updated); setStorage("events", updated); }
  function openCreate() { setForm({ ...EMPTY }); setLineupText(""); setSetTimesText(""); setTickets([{ name: "", url: "" }]); setDone(false); setModal("create"); }
  function openEdit(e: Event) {
    setSelected(e); setForm({ ...e });
    setLineupText(e.lineup.join("\n"));
    setSetTimesText((e.setTimes ?? []).map(s => `${s.artist}|${s.time}`).join("\n"));
    setTickets((e.ticketLinks ?? []).length > 0
      ? e.ticketLinks!
      : [{ name: "", url: "" }]
    ); // ← reemplaza setTicketsText(...)
    setDone(false); setModal("edit");
  }
  function openDelete(e: Event) { setSelected(e); setModal("delete"); }

  async function handleFlyer(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setConv(true); setDone(false);
    try { const webp = await convertToWebP(file); setForm(f => ({ ...f, flyer: webp })); setDone(true); }
    catch { alert("Error al procesar el flyer."); }
    finally { setConv(false); }
  }

  function parseLines(text: string) { return text.split("\n").map(s => s.trim()).filter(Boolean); }
  function parseSetTimes(text: string) { return parseLines(text).map(line => { const [artist, time] = line.split("|").map(s => s.trim()); return { artist: artist ?? "", time: time ?? "" }; }); }
  function parseTickets(text: string) { return parseLines(text).map(line => { const [name, url] = line.split("|").map(s => s.trim()); return { name: name ?? "", url: url ?? "" }; }); }

  function handleSave() {
    if (!form.name.trim() || !form.date) return;
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const flyer = form.flyer || generatePlaceholderImage(form.name);
    const data: Event = { ...form, slug, flyer, lineup: parseLines(lineupText), setTimes: parseSetTimes(setTimesText), ticketLinks: tickets.filter(t => t.name || t.url), isPast: new Date(form.date) < new Date() };
    if (modal === "create") {
      persist([{ ...data, id: Date.now().toString() }, ...events]); logAction(`Creó evento "${form.name}"`, "eventos");
    }
    else if (modal === "edit" && selected) { persist(events.map(e => e.id === selected.id ? { ...data, id: selected.id } : e)); logAction(`Editó evento "${form.name}"`, "eventos"); }
    setModal(null);
  }

  function handleDelete() {
    if (!selected) return;
    persist(events.filter(e => e.id !== selected.id));
    logAction(`Eliminó evento "${selected.name}"`, "eventos");
    setModal(null);
  }

  const upcoming = events.filter(e => !e.isPast);
  const past = events.filter(e => e.isPast);

  return (
    <AdminLayout>
      <div style={{ padding: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.04em", color: t.text, marginBottom: 4 }}>Eventos</h1>
            <p style={{ fontSize: 11, color: t.textMuted }}>{upcoming.length} próximos · {past.length} pasados{!canEdit && " · Solo lectura"}</p>
          </div>
          {canEdit && <button onClick={openCreate} style={{ backgroundColor: t.accent, color: t.accentText, padding: "9px 18px", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>+ Nuevo evento</button>}
        </div>

        {upcoming.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: t.textMuted, textTransform: "uppercase", marginBottom: "0.75rem" }}>Próximos eventos</div>
            {upcoming.map(e => <EventRow key={e.id} event={e} canEdit={canEdit} onEdit={openEdit} onDelete={openDelete} t={t} />)}
          </div>
        )}
        {past.length > 0 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: t.textMuted, textTransform: "uppercase", marginBottom: "0.75rem" }}>Ediciones pasadas</div>
            {past.map(e => <EventRow key={e.id} event={e} canEdit={canEdit} onEdit={openEdit} onDelete={openDelete} t={t} />)}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {(modal === "create" || modal === "edit") && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 100, padding: "2rem", overflowY: "auto" }}>
          <div style={{ backgroundColor: t.bgModal, border: `1px solid ${t.border}`, padding: "2rem", width: "100%", maxWidth: 640, marginBottom: "2rem" }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: t.text, marginBottom: "1.75rem" }}>{modal === "create" ? "NUEVO EVENTO" : `EDITAR — ${selected?.name}`}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div><label style={lbl}>Nombre del evento *</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: SYNTESIS 00x" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label style={lbl}>Fecha *</label><input type="date" style={inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div><label style={lbl}>Hora *</label><input type="time" style={inp} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>

              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label style={lbl}>Ciudad</label><input style={inp} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ej: Buenos Aires" /></div>
                <div><label style={lbl}>Venue</label><input style={inp} value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Ej: Club de Pescadores" /></div>
              </div>
              <div><label style={lbl}>Descripción</label><input style={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label style={lbl}>Lineup (un artista por línea)</label><textarea style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.7 }} value={lineupText} onChange={e => setLineupText(e.target.value)} placeholder={"PAKARD\nBONDARÜK & SMT"} /></div>
              <div><label style={lbl}>Set Times (Artista|HH:MM - HH:MM — una línea por artista)</label><textarea style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.7 }} value={setTimesText} onChange={e => setSetTimesText(e.target.value)} placeholder={"PAKARD|00:00 - 02:00\nBONDARÜK & SMT|02:00 - 04:00"} /></div>
              <div>
                <label style={lbl}>Links de tickets</label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "6px", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.12em", color: t.textMuted, textTransform: "uppercase" }}>Nombre</span>
                  <span style={{ fontSize: 9, letterSpacing: "0.12em", color: t.textMuted, textTransform: "uppercase" }}>URL</span>
                  <span />
                </div>

                {tickets.map((ticket, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "6px", marginBottom: 6 }}>
                    <input
                      style={inp}
                      placeholder="Ej: Bombo"
                      value={ticket.name}
                      onChange={e => setTickets(prev => prev.map((t, idx) => idx === i ? { ...t, name: e.target.value } : t))}
                    />
                    <input
                      style={inp}
                      placeholder="https://..."
                      value={ticket.url}
                      onChange={e => setTickets(prev => prev.map((t, idx) => idx === i ? { ...t, url: e.target.value } : t))}
                    />
                    <button
                      type="button"
                      onClick={() => setTickets(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", fontSize: 13 }}
                    >✕</button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setTickets(prev => [...prev, { name: "", url: "" }])}
                  style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: t.textMuted, background: "none", border: `1px solid ${t.border}`, padding: "5px 12px", cursor: "pointer", marginTop: 2 }}
                >+ Agregar link</button>
              </div>
              <div><label style={lbl}>Recorded Sets (URL Soundcloud)</label><input style={inp} value={form.recordedSets ?? ""} onChange={e => setForm(f => ({ ...f, recordedSets: e.target.value }))} placeholder="https://soundcloud.com/..." /></div>
              <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: "1.25rem" }}>
                <label style={lbl}>Flyer del evento</label>
                <input type="file" accept="image/*" onChange={handleFlyer} style={{ fontSize: 12, color: t.textMuted, cursor: "pointer" }} />
                {converting && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>⏳ Convirtiendo a WebP...</div>}
                {converted && !converting && <div style={{ fontSize: 11, color: t.success, marginTop: 8 }}>✓ Flyer optimizado para web (WebP)</div>}
                {form.flyer && !converting && <img src={form.flyer} alt="Flyer" style={{ marginTop: 10, height: 100, border: `1px solid ${t.border}` }} />}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: "0.75rem" }}>
                <button onClick={handleSave} style={{ flex: 1, backgroundColor: t.accent, color: t.accentText, padding: "10px", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>{modal === "create" ? "Crear evento" : "Guardar cambios"}</button>
                <button onClick={() => setModal(null)} style={{ flex: 1, backgroundColor: "transparent", color: t.textMuted, padding: "10px", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${t.border}`, cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: t.bgModal, border: `1px solid ${t.border}`, padding: "2rem", width: "100%", maxWidth: 380, textAlign: "center" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 8 }}>¿Eliminar evento?</h2>
            <p style={{ fontSize: 12, color: t.textMuted, marginBottom: "1.5rem", lineHeight: 1.6 }}>Se eliminará <strong style={{ color: t.text }}>{selected?.name}</strong>.</p>
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

function EventRow({ event, canEdit, onEdit, onDelete, t }: { event: Event; canEdit: boolean; onEdit: (e: Event) => void; onDelete: (e: Event) => void; t: any }) {
  return (
    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {event.flyer
          ? <img src={event.flyer} alt={event.name} style={{ width: 48, height: 60, objectFit: "cover", flexShrink: 0 }} />
          : <div style={{ width: 48, height: 60, backgroundColor: t.bg, border: `1px solid ${t.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, color: t.textFaint }}>N/A</span></div>
        }
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 2 }}>{event.name}</div>
          <div style={{ fontSize: 11, color: t.textMuted }}>
            {new Date(event.date).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}{event.time && ` · ${event.time}`}
            {event.venue && ` · ${event.venue}`}{event.city && `, ${event.city}`}
          </div>
          <div style={{ fontSize: 10, color: t.textFaint, marginTop: 2 }}>{event.lineup.join(" / ")}</div>
        </div>
      </div>
      {canEdit && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => onEdit(event)} style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted, background: "none", border: `1px solid ${t.border}`, padding: "4px 10px", cursor: "pointer" }}>Editar</button>
          <button onClick={() => onDelete(event)} style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: t.danger, background: "none", border: `1px solid ${t.dangerBorder}`, padding: "4px 10px", cursor: "pointer" }}>Eliminar</button>
        </div>
      )}
    </div>
  );
}

function generatePlaceholderImage(name: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800; canvas.height = 800;
  const ctx = canvas.getContext("2d")!;
  
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, 800, 800);
  
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  const words = name.toUpperCase().split(" ");
  const fontSize = words.some(w => w.length > 8) ? 72 : 88;
  ctx.font = `700 ${fontSize}px sans-serif`;
  
  if (words.length === 1) {
    ctx.fillText(words[0], 400, 400);
  } else {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(" ");
    const line2 = words.slice(mid).join(" ");
    ctx.fillText(line1, 400, 340);
    ctx.fillText(line2, 400, 460);
  }
  
  return canvas.toDataURL("image/webp", 0.9);
}