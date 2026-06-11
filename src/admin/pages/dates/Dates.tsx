/**
 * Dates.tsx — v4
 * CRUD de próximas fechas con Supabase como backend.
 * Merge: Supabase (master) + startDate/endDate/time, validación (colegas)
 */
import { useState, useEffect } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import AdminLayout from "@/admin/components/AdminLayout";
import { Navigate } from "react-router-dom";
import { artists as defaultArtists, Artist } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

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

export interface BookingDateV2 {
  id: string;
  date: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  artists: string[];
  venue: string;
  promoter: string;
  country: string;
  city: string;
  ticketUrl?: string;
  image?: string;
}

const EMPTY: BookingDateV2 = {
  id: "", date: "",
  startDate: "", startTime: "",
  endDate: "", endTime: "",
  artists: [], venue: "", promoter: "Syntesis",
  country: "", city: "", ticketUrl: "", image: "",
};

export default function Dates() {
  const { can, currentUser, logAction, theme } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  const hasAccess = currentUser?.isSuperAdmin || can("editor_fechas");
  if (!hasAccess) return <Navigate to="/admin/dashboard" replace />;
  const canEdit = hasAccess;

  const [dates, setDates]         = useState<BookingDateV2[]>([]);
  const [loading, setLoading]     = useState(true);
  const [artists, setArtists]     = useState<Artist[]>([]);
  const [modal, setModal]         = useState<null|"create"|"edit"|"delete">(null);
  const [selected, setSelected]   = useState<BookingDateV2|null>(null);
  const [form, setForm]           = useState<BookingDateV2>({...EMPTY});
  const [converting, setConv]     = useState(false);
  const [converted, setDone]      = useState(false);
  const [artistDropdown, setArtistDropdown] = useState(false);
  const [errors, setErrors]       = useState<string[]>([]);

  const inp: React.CSSProperties = { width:"100%", backgroundColor:t.bgInput, border:`1px solid ${t.border}`, color:t.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" };
  const lbl: React.CSSProperties = { fontSize:9, letterSpacing:"0.18em", color:t.textMuted, display:"block", marginBottom:5, textTransform:"uppercase" };

  useEffect(() => {
    async function load() {
      const { data: artistData } = await supabase.from("artists").select("*").order("sort_order");
      setArtists(artistData && artistData.length > 0 ? artistData : defaultArtists);

      const { data, error } = await supabase.from("dates").select("*").order("date");
      if (error || !data || data.length === 0) {
        setDates([]);
      } else {
        setDates(data.map(row => ({
          id: row.id,
          date: row.date ?? "",
          startDate: row.start_date ?? row.date ?? "",
          startTime: row.start_time ?? "",
          endDate: row.end_date ?? "",
          endTime: row.end_time ?? "",
          artists: row.artists ?? [],
          venue: row.venue ?? "",
          promoter: row.promoter ?? "Syntesis",
          country: row.country ?? "",
          city: row.city ?? "",
          ticketUrl: row.ticket_url ?? "",
          image: row.image ?? "",
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  function openCreate() { setForm({...EMPTY}); setErrors([]); setDone(false); setArtistDropdown(false); setModal("create"); }
  function openEdit(d: BookingDateV2) { setSelected(d); setForm({...d, artists:[...d.artists]}); setErrors([]); setDone(false); setArtistDropdown(false); setModal("edit"); }
  function openDelete(d: BookingDateV2) { setSelected(d); setModal("delete"); }

  function toggleArtist(name: string) {
    setForm(f => ({
      ...f,
      artists: f.artists.includes(name) ? f.artists.filter(a => a !== name) : [...f.artists, name],
    }));
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setConv(true); setDone(false);
    try { const webp = await convertToWebP(file); setForm(f=>({...f,image:webp})); setDone(true); }
    catch { alert("Error al procesar la imagen."); }
    finally { setConv(false); }
  }

  async function handleSave() {
    const errs: string[] = [];
    if (form.artists.length === 0) errs.push("Seleccioná al menos un artista.");
    if (!form.startDate) errs.push("La fecha de inicio es obligatoria.");
    if (!form.startTime) errs.push("La hora de inicio es obligatoria.");
    if (!form.endDate) errs.push("La fecha de término es obligatoria.");
    if (!form.endTime) errs.push("La hora de término es obligatoria.");
    if (!form.venue.trim()) errs.push("El venue es obligatorio.");
    if (form.startDate && form.startDate < "2024-09-01") errs.push("No se permiten fechas anteriores a septiembre de 2024.");
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);

    const row = {
      id: modal === "create" ? Date.now().toString() : selected!.id,
      date: form.startDate,
      start_date: form.startDate,
      start_time: form.startTime,
      end_date: form.endDate,
      end_time: form.endTime,
      artists: form.artists,
      venue: form.venue,
      promoter: form.promoter,
      country: form.country,
      city: form.city,
      ticket_url: form.ticketUrl,
      image: form.image,
    };

    if (modal === "create") {
      const { error } = await supabase.from("dates").insert(row);
      if (error) { alert("Error al guardar: " + error.message); return; }
      setDates(prev => [...prev, {...form, id: row.id, date: form.startDate!}].sort((a,b) => a.date.localeCompare(b.date)));
      logAction(`Creó fecha: ${form.artists.join(" & ")} en ${form.venue}`, "fechas");
    } else if (modal === "edit" && selected) {
      const { error } = await supabase.from("dates").update(row).eq("id", selected.id);
      if (error) { alert("Error al guardar: " + error.message); return; }
      setDates(prev => prev.map(d => d.id === selected.id ? {...form, id: selected.id, date: form.startDate!} : d).sort((a,b) => a.date.localeCompare(b.date)));
      logAction(`Editó fecha: ${form.artists.join(" & ")} en ${form.venue}`, "fechas");
    }
    setModal(null);
  }

  async function handleDelete() {
    if (!selected) return;
    const { error } = await supabase.from("dates").delete().eq("id", selected.id);
    if (error) { alert("Error al eliminar: " + error.message); return; }
    setDates(prev => prev.filter(d => d.id !== selected.id));
    logAction(`Eliminó fecha id:${selected.id}`, "fechas");
    setModal(null);
  }

  const today    = new Date().toISOString().split("T")[0];
  const upcoming = dates.filter(d => (d.startDate || d.date) >= today);
  const past     = dates.filter(d => (d.startDate || d.date) < today);

  if (loading) return <AdminLayout><div style={{padding:"2.5rem",color:t.textMuted,fontSize:13}}>Cargando fechas...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{padding:"2.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2rem"}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,letterSpacing:"0.04em",color:t.text,marginBottom:4}}>Fechas</h1>
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

      {(modal==="create"||modal==="edit") && (
        <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:100,padding:"2rem",overflowY:"auto"}}>
          <div style={{backgroundColor:t.bgModal,border:`1px solid ${t.border}`,padding:"2rem",width:"100%",maxWidth:540,marginBottom:"2rem"}}>
            <h2 style={{fontSize:12,fontWeight:700,letterSpacing:"0.15em",color:t.text,marginBottom:"1.75rem"}}>{modal==="create"?"NUEVA FECHA":"EDITAR FECHA"}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>

              <div>
                <label style={lbl}>Artistas * (podés seleccionar más de uno)</label>
                <div onClick={()=>setArtistDropdown(!artistDropdown)} style={{...inp, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", userSelect:"none"}}>
                  <span style={{color: form.artists.length>0 ? t.text : t.textFaint}}>
                    {form.artists.length>0 ? form.artists.join(", ") : "Seleccionar artistas..."}
                  </span>
                  <span style={{fontSize:10,color:t.textFaint}}>{artistDropdown?"▲":"▼"}</span>
                </div>
                {artistDropdown && (
                  <div style={{border:`1px solid ${t.border}`,borderTop:"none",backgroundColor:t.bgInput,maxHeight:200,overflowY:"auto"}}>
                    {artists.map(a=>(
                      <label key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:"pointer",borderBottom:`1px solid ${t.border}`,color:t.text,fontSize:12}}>
                        <input type="checkbox" checked={form.artists.includes(a.name)} onChange={()=>toggleArtist(a.name)} style={{accentColor:t.accent}}/>
                        {a.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>Fecha Inicio *</label><input type="date" min="2024-09-01" style={inp} value={form.startDate||""} onChange={e=>setForm(f=>({...f,startDate:e.target.value,date:e.target.value}))}/></div>
                <div><label style={lbl}>Hora Inicio *</label><input type="time" style={inp} value={form.startTime||""} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}/></div>
                <div><label style={lbl}>Fecha Término *</label><input type="date" min="2024-09-01" style={inp} value={form.endDate||""} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}/></div>
                <div><label style={lbl}>Hora Término *</label><input type="time" style={inp} value={form.endTime||""} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}/></div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>Venue *</label><input style={inp} value={form.venue} onChange={e=>setForm(f=>({...f,venue:e.target.value}))} placeholder="Ej: Club de Pescadores"/></div>
                <div><label style={lbl}>Ciudad</label><input style={inp} value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Ej: Buenos Aires"/></div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>País</label><input style={inp} value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} placeholder="Ej: Argentina"/></div>
                <div><label style={lbl}>Promoter</label><input style={inp} value={form.promoter} onChange={e=>setForm(f=>({...f,promoter:e.target.value}))} placeholder="Ej: Syntesis"/></div>
              </div>

              <div><label style={lbl}>Link de tickets (opcional)</label><input style={inp} value={form.ticketUrl??""} onChange={e=>setForm(f=>({...f,ticketUrl:e.target.value}))} placeholder="https://..."/></div>

              <div style={{borderTop:`1px solid ${t.border}`,paddingTop:"1.25rem"}}>
                <label style={lbl}>Imagen / Flyer (opcional)</label>
                <input type="file" accept="image/*" onChange={handleImage} style={{fontSize:12,color:t.textMuted,cursor:"pointer"}}/>
                {converting && <div style={{fontSize:11,color:t.textMuted,marginTop:8}}>⏳ Convirtiendo a WebP...</div>}
                {converted && !converting && <div style={{fontSize:11,color:t.success,marginTop:8}}>✓ Imagen optimizada para web (WebP)</div>}
                {form.image && !converting && <img src={form.image} alt="Preview" style={{marginTop:10,height:90,border:`1px solid ${t.border}`}}/>}
              </div>

              {errors.length > 0 && (
                <div style={{backgroundColor:t.dangerBg,border:`1px solid ${t.dangerBorder}`,padding:"10px 14px"}}>
                  {errors.map((err,i) => <div key={i} style={{fontSize:11,color:t.danger,lineHeight:1.8}}>{err}</div>)}
                </div>
              )}

              <div style={{display:"flex",gap:8,marginTop:"0.5rem"}}>
                <button onClick={handleSave} style={{flex:1,backgroundColor:t.accent,color:t.accentText,padding:"10px",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",cursor:"pointer"}}>{modal==="create"?"Crear fecha":"Guardar cambios"}</button>
                <button onClick={()=>setModal(null)} style={{flex:1,backgroundColor:"transparent",color:t.textMuted,padding:"10px",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",border:`1px solid ${t.border}`,cursor:"pointer"}}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  const displayDate = date.startDate || date.date;
  return (
    <div style={{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,padding:"1rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
        {date.image
          ? <img src={date.image} alt="flyer" style={{width:44,height:56,objectFit:"cover",flexShrink:0,border:`1px solid ${t.border}`}}/>
          : <div style={{width:44,height:56,backgroundColor:t.bg,border:`1px solid ${t.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:7,color:t.textFaint}}>N/A</span></div>
        }
        <div>
          <div style={{fontSize:10,color:t.textFaint,letterSpacing:"0.08em",marginBottom:3}}>
            {new Date(displayDate+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            {date.startTime && ` · ${date.startTime}`}
            {date.endDate && date.endTime && ` → ${date.endTime}`}
          </div>
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
