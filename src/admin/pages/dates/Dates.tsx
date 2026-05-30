/**
 * Dates.tsx — v2
 * ─────────────────────────────────────────────────────────────────────────────
 * CRUD de próximas fechas de presentación de artistas.
 *
 * Cambios v2:
 *  - Soporte de múltiples artistas por fecha (selector con checkboxes)
 *  - Subida de imagen/flyer con conversión automática a WebP
 *  - Confirmación visual "✓ Optimizada a WebP"
 *  - Soporte de tema oscuro/claro
 *  - Permisos actualizados al sistema v2
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import AdminLayout from "@/admin/components/AdminLayout";
import { Navigate } from "react-router-dom";
import { artists as defaultArtists, bookingDates as defaultDates, Artist, BookingDate } from "@/data/mockData";

/** Convierte cualquier imagen a WebP usando Canvas API */
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
    img.onerror = () => reject("Error al cargar"); img.src = url;
  });
}

/**
 * BookingDateV2 extiende BookingDate con:
 *  - artists[]: array de nombres de artistas (en lugar de un solo artist)
 *  - image?: imagen/flyer de la fecha en base64 WebP
 */
export interface BookingDateV2 extends Omit<BookingDate, "artist" | "artistSlug"> {
  artists: string[];   // Múltiples artistas
  image?: string;      // Flyer/imagen en base64 WebP (opcional)
}

const EMPTY: BookingDateV2 = {
  id: "", date: "", artists: [], venue: "", promoter: "Syntesis",
  country: "", city: "", ticketUrl: "", image: "",
};

export default function Dates() {
  const { can, currentUser, getStorage, setStorage, logAction, theme } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  const hasAccess = currentUser?.isSuperAdmin || can("editor_fechas");
  if (!hasAccess) return <Navigate to="/admin/dashboard" replace />;
  const canEdit = hasAccess;

  // Carga artistas del localStorage o usa mockData
  const storedArtists = getStorage<Artist[]>("artists");
  const artists = storedArtists ?? defaultArtists;

  // Carga fechas — intenta leer como BookingDateV2, fallback al mockData
  const stored = getStorage<BookingDateV2[]>("dates");
  const [dates, setDates]       = useState<BookingDateV2[]>(stored ?? []);
  const [modal, setModal]       = useState<null|"create"|"edit"|"delete">(null);
  const [selected, setSelected] = useState<BookingDateV2|null>(null);
  const [form, setForm]         = useState<BookingDateV2>({...EMPTY});
  const [converting, setConv]   = useState(false);
  const [converted, setDone]    = useState(false);
  // Controla si el dropdown de artistas está abierto
  const [artistDropdown, setArtistDropdown] = useState(false);

  const inp: React.CSSProperties = { width:"100%", backgroundColor:t.bgInput, border:`1px solid ${t.border}`, color:t.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" };
  const lbl: React.CSSProperties = { fontSize:9, letterSpacing:"0.18em", color:t.textMuted, display:"block", marginBottom:5, textTransform:"uppercase" };

  function persist(updated: BookingDateV2[]) {
    const sorted = [...updated].sort((a,b)=>a.date.localeCompare(b.date));
    setDates(sorted); setStorage("dates", sorted);
  }

  function openCreate() { setForm({...EMPTY}); setDone(false); setArtistDropdown(false); setModal("create"); }
  function openEdit(d: BookingDateV2) { setSelected(d); setForm({...d,artists:[...d.artists]}); setDone(false); setArtistDropdown(false); setModal("edit"); }
  function openDelete(d: BookingDateV2) { setSelected(d); setModal("delete"); }

  /** Alterna un artista en el array del formulario */
  function toggleArtist(name: string) {
    setForm(f => ({
      ...f,
      artists: f.artists.includes(name)
        ? f.artists.filter(a => a !== name)
        : [...f.artists, name],
    }));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setConv(true); setDone(false);
    try { const webp = await convertToWebP(file); setForm(f=>({...f,image:webp})); setDone(true); }
    catch { alert("Error al procesar la imagen."); }
    finally { setConv(false); }
  }

  function handleSave() {
    if (form.artists.length === 0 || !form.date || !form.venue) return;
    if (form.date < "2024-09-01") { alert("No se permiten fechas anteriores a septiembre de 2024."); return; }
    const data: BookingDateV2 = { ...form };
    if (modal === "create") {
      persist([...dates, {...data, id:Date.now().toString()}]);
      logAction(`Creó fecha: ${form.artists.join(" & ")} en ${form.venue}`, "fechas");
    } else if (modal === "edit" && selected) {
      persist(dates.map(d => d.id===selected.id ? {...data} : d));
      logAction(`Editó fecha: ${form.artists.join(" & ")} en ${form.venue}`, "fechas");
    }
    setModal(null);
  }

  function handleDelete() {
    if (!selected) return;
    persist(dates.filter(d=>d.id!==selected.id));
    logAction(`Eliminó fecha id:${selected.id}`, "fechas");
    setModal(null);
  }

  const today    = new Date().toISOString().split("T")[0];
  const upcoming = dates.filter(d=>d.date>=today);
  const past     = dates.filter(d=>d.date<today);

  return (
    <AdminLayout>
      <div style={{padding:"2.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2rem"}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,letterSpacing:"0.04em",color:t.text,marginBottom:4}}>Próximas Fechas</h1>
            <p style={{fontSize:11,color:t.textMuted}}>{upcoming.length} próximas · {past.length} pasadas</p>
          </div>
          {canEdit && <button onClick={openCreate} style={{backgroundColor:t.accent,color:t.accentText,padding:"9px 18px",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",cursor:"pointer"}}>+ Nueva fecha</button>}
        </div>

        {upcoming.length>0 && (
          <div style={{marginBottom:"2rem"}}>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:t.textMuted,textTransform:"uppercase",marginBottom:"0.75rem"}}>Próximas presentaciones</div>
            {upcoming.map(d=><DateRow key={d.id} date={d} canEdit={canEdit} onEdit={openEdit} onDelete={openDelete} t={t}/>)}
          </div>
        )}
        {past.length>0 && (
          <div>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:t.textMuted,textTransform:"uppercase",marginBottom:"0.75rem"}}>Fechas pasadas</div>
            {past.map(d=><DateRow key={d.id} date={d} canEdit={canEdit} onEdit={openEdit} onDelete={openDelete} t={t}/>)}
          </div>
        )}
        {dates.length===0 && <div style={{textAlign:"center",padding:"4rem",color:t.textFaint,fontSize:13}}>No hay fechas cargadas aún.</div>}
      </div>

      {/* Modal crear/editar */}
      {(modal==="create"||modal==="edit") && (
        <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:100,padding:"2rem",overflowY:"auto"}}>
          <div style={{backgroundColor:t.bgModal,border:`1px solid ${t.border}`,padding:"2rem",width:"100%",maxWidth:540,marginBottom:"2rem"}}>
            <h2 style={{fontSize:12,fontWeight:700,letterSpacing:"0.15em",color:t.text,marginBottom:"1.75rem"}}>{modal==="create"?"NUEVA FECHA":"EDITAR FECHA"}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>

              {/* Selector de artistas con checkboxes */}
              <div>
                <label style={lbl}>Artistas * (podés seleccionar más de uno)</label>
                {/* Muestra los artistas seleccionados */}
                <div
                  onClick={()=>setArtistDropdown(!artistDropdown)}
                  style={{...inp, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", userSelect:"none"}}
                >
                  <span style={{color: form.artists.length>0 ? t.text : t.textFaint}}>
                    {form.artists.length>0 ? form.artists.join(", ") : "Seleccionar artistas..."}
                  </span>
                  <span style={{fontSize:10,color:t.textFaint}}>{artistDropdown?"▲":"▼"}</span>
                </div>
                {/* Dropdown con checkboxes */}
                {artistDropdown && (
                  <div style={{border:`1px solid ${t.border}`,borderTop:"none",backgroundColor:t.bgInput,maxHeight:200,overflowY:"auto"}}>
                    {artists.map(a=>(
                      <label key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:"pointer",borderBottom:`1px solid ${t.border}`,color:t.text,fontSize:12}}>
                        <input
                          type="checkbox"
                          checked={form.artists.includes(a.name)}
                          onChange={()=>toggleArtist(a.name)}
                          style={{accentColor:t.accent}}
                        />
                        {a.name}
                      </label>
                    ))}
                  </div>
                )}
                {form.artists.length===0 && <div style={{fontSize:10,color:t.danger,marginTop:4}}>Seleccioná al menos un artista</div>}
              </div>

              {/* Fecha */}
              <div><label style={lbl}>Fecha *</label><input type="date" min="2024-09-01" style={inp} value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>

              {/* Venue + Ciudad */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>Venue *</label><input style={inp} value={form.venue} onChange={e=>setForm(f=>({...f,venue:e.target.value}))} placeholder="Ej: Club de Pescadores"/></div>
                <div><label style={lbl}>Ciudad</label><input style={inp} value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Ej: Buenos Aires"/></div>
              </div>

              {/* País + Promoter */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>País</label><input style={inp} value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} placeholder="Ej: Argentina"/></div>
                <div><label style={lbl}>Promoter</label><input style={inp} value={form.promoter} onChange={e=>setForm(f=>({...f,promoter:e.target.value}))} placeholder="Ej: Syntesis"/></div>
              </div>

              {/* Link tickets */}
              <div><label style={lbl}>Link de tickets (opcional)</label><input style={inp} value={form.ticketUrl??""} onChange={e=>setForm(f=>({...f,ticketUrl:e.target.value}))} placeholder="https://..."/></div>

              {/* Imagen/flyer con conversión WebP */}
              <div style={{borderTop:`1px solid ${t.border}`,paddingTop:"1.25rem"}}>
                <label style={lbl}>Imagen / Flyer (opcional)</label>
                <input type="file" accept="image/*" onChange={handleImage} style={{fontSize:12,color:t.textMuted,cursor:"pointer"}}/>
                {converting && <div style={{fontSize:11,color:t.textMuted,marginTop:8}}>⏳ Convirtiendo a WebP para optimización web...</div>}
                {converted && !converting && <div style={{fontSize:11,color:t.success,marginTop:8}}>✓ Imagen optimizada para web (WebP)</div>}
                {form.image && !converting && <img src={form.image} alt="Preview" style={{marginTop:10,height:90,border:`1px solid ${t.border}`}}/>}
              </div>

              {/* Acciones */}
              <div style={{display:"flex",gap:8,marginTop:"0.5rem"}}>
                <button onClick={handleSave} style={{flex:1,backgroundColor:t.accent,color:t.accentText,padding:"10px",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",cursor:"pointer"}}>{modal==="create"?"Crear fecha":"Guardar cambios"}</button>
                <button onClick={()=>setModal(null)} style={{flex:1,backgroundColor:"transparent",color:t.textMuted,padding:"10px",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",border:`1px solid ${t.border}`,cursor:"pointer"}}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {modal==="delete" && (
        <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
          <div style={{backgroundColor:t.bgModal,border:`1px solid ${t.border}`,padding:"2rem",width:"100%",maxWidth:380,textAlign:"center"}}>
            <h2 style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:8}}>¿Eliminar fecha?</h2>
            <p style={{fontSize:12,color:t.textMuted,marginBottom:"1.5rem",lineHeight:1.6}}>
              Se eliminará la fecha de <strong style={{color:t.text}}>{selected?.artists.join(" & ")}</strong> en <strong style={{color:t.text}}>{selected?.venue}</strong>.
            </p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={handleDelete} style={{flex:1,backgroundColor:t.dangerBg,color:t.danger,padding:"9px",fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",border:`1px solid ${t.dangerBorder}`,cursor:"pointer"}}>Eliminar</button>
              <button onClick={()=>setModal(null)} style={{flex:1,backgroundColor:"transparent",color:t.textMuted,padding:"9px",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",border:`1px solid ${t.border}`,cursor:"pointer"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function DateRow({date,canEdit,onEdit,onDelete,t}: {date:BookingDateV2; canEdit:boolean; onEdit:(d:BookingDateV2)=>void; onDelete:(d:BookingDateV2)=>void; t:any}) {
  return (
    <div style={{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
        {/* Thumbnail del flyer si existe */}
        {date.image
          ? <img src={date.image} alt="flyer" style={{width:44,height:56,objectFit:"cover",flexShrink:0,border:`1px solid ${t.border}`}}/>
          : <div style={{width:44,height:56,backgroundColor:t.bg,border:`1px solid ${t.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,color:t.textFaint}}>N/A</span></div>
        }
        <div>
          <div style={{fontSize:10,color:t.textFaint,letterSpacing:"0.08em",marginBottom:3}}>
            {new Date(date.date+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </div>
          {/* Muestra todos los artistas */}
          <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:2}}>{date.artists.join(" & ")}</div>
          <div style={{fontSize:11,color:t.textMuted}}>{date.venue}{date.city&&`, ${date.city}`}{date.country&&` — ${date.country}`}</div>
          {date.ticketUrl && <a href={date.ticketUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:t.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",textDecoration:"none",marginTop:4,display:"inline-block"}} onClick={e=>e.stopPropagation()}>Buy Tickets →</a>}
        </div>
      </div>
      {canEdit && (
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={()=>onEdit(date)} style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:t.textMuted,background:"none",border:`1px solid ${t.border}`,padding:"4px 10px",cursor:"pointer"}}>Editar</button>
          <button onClick={()=>onDelete(date)} style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:t.danger,background:"none",border:`1px solid ${t.dangerBorder}`,padding:"4px 10px",cursor:"pointer"}}>Eliminar</button>
        </div>
      )}
    </div>
  );
}
