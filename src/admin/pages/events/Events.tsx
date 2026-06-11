/**
 * Events.tsx — v4
 * CRUD de eventos con Supabase como backend.
 * Merge: Supabase (master) + startDate/endDate, placeholder, validación, fix tickets (colegas)
 */
import { useState, useEffect } from "react";
import { useAdmin } from "@/admin/context/AdminContext";
import { darkTheme, lightTheme } from "@/admin/components/theme";
import AdminLayout from "@/admin/components/AdminLayout";
import { Navigate } from "react-router-dom";
import { events as defaultEvents, Event } from "@/data/mockData";
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
    img.onerror = () => reject("Error"); img.src = url;
  });
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
    ctx.fillText(words.slice(0, mid).join(" "), 400, 340);
    ctx.fillText(words.slice(mid).join(" "), 400, 460);
  }
  return canvas.toDataURL("image/webp", 0.9);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })
    .toUpperCase();
}

const EMPTY: Event = {
  id:"", name:"", slug:"",
  date:"", time:"",
  startDate:"", startTime:"",
  endDate:"", endTime:"",
  venue:"", city:"", flyer:"", description:"",
  lineup:[], isPast:false, setTimes:[], ticketLinks:[], recordedSets:""
};

export default function Events() {
  const { can, currentUser, logAction, theme } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  const hasView = currentUser?.isSuperAdmin || can("editor_eventos") || can("editor_artistas");
  if (!hasView) return <Navigate to="/admin/dashboard" replace />;
  const canEdit = currentUser?.isSuperAdmin || can("editor_eventos");

  const [events, setEvents]         = useState<Event[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState<null|"create"|"edit"|"delete">(null);
  const [selected, setSelected]     = useState<Event|null>(null);
  const [form, setForm]             = useState<Event>({...EMPTY});
  const [lineupText, setLineupText] = useState("");
  const [setTimesText, setSetTimesText] = useState("");
  const [tickets, setTickets]       = useState<{name:string;url:string}[]>([{name:"",url:""}]);
  const [converting, setConv]       = useState(false);
  const [converted, setDone]        = useState(false);
  const [errors, setErrors]         = useState<string[]>([]);

  const inp: React.CSSProperties = { width:"100%", backgroundColor:t.bgInput, border:`1px solid ${t.border}`, color:t.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" };
  const lbl: React.CSSProperties = { fontSize:9, letterSpacing:"0.18em", color:t.textMuted, display:"block", marginBottom:5, textTransform:"uppercase" };

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
      if (error || !data || data.length === 0) {
        setEvents(defaultEvents);
      } else {
        setEvents(data.map(row => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          date: row.date ?? "",
          time: row.time ?? "",
          startDate: row.start_date ?? row.date ?? "",
          startTime: row.start_time ?? "",
          endDate: row.end_date ?? "",
          endTime: row.end_time ?? "",
          venue: row.venue ?? "",
          city: row.city ?? "",
          flyer: row.flyer ?? "",
          description: row.description ?? "",
          lineup: row.lineup ?? [],
          setTimes: row.set_times ?? [],
          ticketLinks: row.ticket_links ?? [],
          recordedSets: row.recorded_sets ?? "",
          isPast: row.is_past ?? false,
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  function openCreate() { setForm({...EMPTY}); setErrors([]); setLineupText(""); setSetTimesText(""); setTickets([{name:"",url:""}]); setDone(false); setModal("create"); }
  function openEdit(e: Event) {
    setSelected(e); setForm({...e});
    setLineupText(e.lineup.join("\n"));
    setSetTimesText((e.setTimes??[]).map(s=>`${s.artist}|${s.time}`).join("\n"));
    setTickets((e.ticketLinks??[]).length > 0 ? e.ticketLinks! : [{name:"",url:""}]);
    setErrors([]); setDone(false); setModal("edit");
  }
  function openDelete(e: Event) { setSelected(e); setModal("delete"); }

  async function handleFlyer(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setConv(true); setDone(false);
    try { const webp = await convertToWebP(file); setForm(f=>({...f,flyer:webp})); setDone(true); }
    catch { alert("Error al procesar el flyer."); }
    finally { setConv(false); }
  }

  function parseLines(text: string) { return text.split("\n").map(s=>s.trim()).filter(Boolean); }
  function parseSetTimes(text: string) { return parseLines(text).map(line=>{ const [artist,time]=line.split("|").map(s=>s.trim()); return {artist:artist??"",time:time??""}; }); }

  async function handleSave() {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("El nombre del evento es obligatorio.");
    if (!form.startDate) errs.push("La fecha de inicio es obligatoria.");
    if (!form.startTime) errs.push("La hora de inicio es obligatoria.");
    if (!form.endDate) errs.push("La fecha de término es obligatoria.");
    if (!form.endTime) errs.push("La hora de término es obligatoria.");
    if (form.startDate && form.startDate < "2024-09-01") errs.push("No se permiten eventos anteriores a septiembre de 2024.");
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);

    const slug = form.name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    const flyer = form.flyer || generatePlaceholderImage(form.name);
    const lineup = parseLines(lineupText);
    const setTimes = parseSetTimes(setTimesText);
    const ticketLinks = tickets.filter(t => t.name || t.url);
    const endDateTime = new Date(`${form.endDate}T${form.endTime||"23:59"}`);
    const isPast = endDateTime < new Date();

    const row = {
      id: modal === "create" ? Date.now().toString() : selected!.id,
      name: form.name,
      slug,
      date: form.startDate,
      time: form.startTime,
      start_date: form.startDate,
      start_time: form.startTime,
      end_date: form.endDate,
      end_time: form.endTime,
      venue: form.venue,
      city: form.city,
      flyer,
      description: form.description,
      lineup,
      set_times: setTimes,
      ticket_links: ticketLinks,
      recorded_sets: form.recordedSets,
      is_past: isPast,
    };

    if (modal === "create") {
      const { error } = await supabase.from("events").insert(row);
      if (error) { alert("Error al guardar: " + error.message); return; }
      setEvents(prev => [{...form, id:row.id, slug, flyer, lineup, setTimes, ticketLinks, isPast, date:form.startDate}, ...prev]);
      logAction(`Creó evento "${form.name}"`, "eventos");
    } else if (modal === "edit" && selected) {
      const { error } = await supabase.from("events").update(row).eq("id", selected.id);
      if (error) { alert("Error al guardar: " + error.message); return; }
      setEvents(prev => prev.map(e => e.id === selected.id ? {...form, id:selected.id, slug, flyer, lineup, setTimes, ticketLinks, isPast, date:form.startDate} : e));
      logAction(`Editó evento "${form.name}"`, "eventos");
    }
    setModal(null);
  }

  async function handleDelete() {
    if (!selected) return;
    const { error } = await supabase.from("events").delete().eq("id", selected.id);
    if (error) { alert("Error al eliminar: " + error.message); return; }
    setEvents(prev => prev.filter(e => e.id !== selected.id));
    logAction(`Eliminó evento "${selected.name}"`, "eventos");
    setModal(null);
  }

  const isEventEnded = (event: Event) => {
    if (event.endDate && event.endTime) return new Date(`${event.endDate}T${event.endTime}`) < new Date();
    return event.isPast;
  };

  const upcoming = events.filter(e => !isEventEnded(e));
  const past     = events.filter(e => isEventEnded(e));

  if (loading) return <AdminLayout><div style={{padding:"2.5rem",color:t.textMuted,fontSize:13}}>Cargando eventos...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{padding:"2.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2rem"}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,letterSpacing:"0.04em",color:t.text,marginBottom:4}}>Eventos</h1>
            <p style={{fontSize:11,color:t.textMuted}}>{upcoming.length} próximos · {past.length} pasados{!canEdit&&" · Solo lectura"}</p>
          </div>
          {canEdit && <button onClick={openCreate} style={{backgroundColor:t.accent,color:t.accentText,padding:"9px 18px",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",cursor:"pointer"}}>+ Nuevo evento</button>}
        </div>

        {upcoming.length>0 && (
          <div style={{marginBottom:"2rem"}}>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:t.textMuted,textTransform:"uppercase",marginBottom:"0.75rem"}}>Próximos eventos</div>
            {upcoming.map(e=><EventRow key={e.id} event={e} canEdit={canEdit} onEdit={openEdit} onDelete={openDelete} t={t}/>)}
          </div>
        )}
        {past.length>0 && (
          <div>
            <div style={{fontSize:9,letterSpacing:"0.18em",color:t.textMuted,textTransform:"uppercase",marginBottom:"0.75rem"}}>Ediciones pasadas</div>
            {past.map(e=><EventRow key={e.id} event={e} canEdit={canEdit} onEdit={openEdit} onDelete={openDelete} t={t}/>)}
          </div>
        )}
      </div>

      {(modal==="create"||modal==="edit") && (
        <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.9)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:100,padding:"2rem",overflowY:"auto"}}>
          <div style={{backgroundColor:t.bgModal,border:`1px solid ${t.border}`,padding:"2rem",width:"100%",maxWidth:640,marginBottom:"2rem"}}>
            <h2 style={{fontSize:12,fontWeight:700,letterSpacing:"0.15em",color:t.text,marginBottom:"1.75rem"}}>{modal==="create"?"NUEVO EVENTO":`EDITAR — ${selected?.name}`}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              <div><label style={lbl}>Nombre del evento *</label><input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ej: SYNTESIS 009"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>Fecha Inicio *</label><input type="date" min="2024-09-01" style={inp} value={form.startDate||""} onChange={e=>setForm(f=>({...f,startDate:e.target.value,date:e.target.value}))}/></div>
                <div><label style={lbl}>Hora Inicio *</label><input type="time" style={inp} value={form.startTime||""} onChange={e=>setForm(f=>({...f,startTime:e.target.value,time:e.target.value}))}/></div>
                <div><label style={lbl}>Fecha Término *</label><input type="date" min="2024-09-01" style={inp} value={form.endDate||""} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))}/></div>
                <div><label style={lbl}>Hora Término *</label><input type="time" style={inp} value={form.endTime||""} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>Venue</label><input style={inp} value={form.venue} onChange={e=>setForm(f=>({...f,venue:e.target.value}))} placeholder="Ej: Club de Pescadores"/></div>
                <div><label style={lbl}>Ciudad</label><input style={inp} value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Ej: Buenos Aires"/></div>
              </div>
              <div><label style={lbl}>Descripción</label><input style={inp} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
              <div><label style={lbl}>Lineup (un artista por línea)</label><textarea style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.7}} value={lineupText} onChange={e=>setLineupText(e.target.value)} placeholder={"PAKARD\nBONDARÜK & SMT"}/></div>
              <div><label style={lbl}>Set Times (Artista|HH:MM - HH:MM)</label><textarea style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.7}} value={setTimesText} onChange={e=>setSetTimesText(e.target.value)} placeholder={"PAKARD|00:00 - 02:00"}/></div>
              <div>
                <label style={lbl}>Links de tickets</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 28px",gap:"6px",marginBottom:6}}>
                  <span style={{fontSize:9,letterSpacing:"0.12em",color:t.textMuted,textTransform:"uppercase"}}>Nombre</span>
                  <span style={{fontSize:9,letterSpacing:"0.12em",color:t.textMuted,textTransform:"uppercase"}}>URL</span>
                  <span/>
                </div>
                {tickets.map((ticket, i) => (
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 28px",gap:"6px",marginBottom:6}}>
                    <input style={inp} placeholder="Ej: Bombo" value={ticket.name} onChange={e=>setTickets(prev=>prev.map((t,idx)=>idx===i?{...t,name:e.target.value}:t))}/>
                    <input style={inp} placeholder="https://..." value={ticket.url} onChange={e=>setTickets(prev=>prev.map((t,idx)=>idx===i?{...t,url:e.target.value}:t))}/>
                    <button type="button" onClick={()=>setTickets(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:"none",border:`1px solid ${t.border}`,color:t.textMuted,cursor:"pointer",fontSize:13}}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={()=>setTickets(prev=>[...prev,{name:"",url:""}])} style={{fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:t.textMuted,background:"none",border:`1px solid ${t.border}`,padding:"5px 12px",cursor:"pointer",marginTop:2}}>+ Agregar link</button>
              </div>
              <div><label style={lbl}>Recorded Sets (URL Soundcloud)</label><input style={inp} value={form.recordedSets??""} onChange={e=>setForm(f=>({...f,recordedSets:e.target.value}))} placeholder="https://soundcloud.com/..."/></div>
              <div style={{borderTop:`1px solid ${t.border}`,paddingTop:"1.25rem"}}>
                <label style={lbl}>Flyer del evento</label>
                <input type="file" accept="image/*" onChange={handleFlyer} style={{fontSize:12,color:t.textMuted,cursor:"pointer"}}/>
                {converting && <div style={{fontSize:11,color:t.textMuted,marginTop:8}}>⏳ Convirtiendo a WebP...</div>}
                {converted && !converting && <div style={{fontSize:11,color:t.success,marginTop:8}}>✓ Flyer optimizado para web (WebP)</div>}
                {form.flyer && !converting && <img src={form.flyer} alt="Flyer" style={{marginTop:10,height:100,border:`1px solid ${t.border}`}}/>}
              </div>
              {errors.length > 0 && (
                <div style={{backgroundColor:t.dangerBg,border:`1px solid ${t.dangerBorder}`,padding:"10px 14px"}}>
                  {errors.map((err,i) => <div key={i} style={{fontSize:11,color:t.danger,lineHeight:1.8}}>{err}</div>)}
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:"0.75rem"}}>
                <button onClick={handleSave} style={{flex:1,backgroundColor:t.accent,color:t.accentText,padding:"10px",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",cursor:"pointer"}}>{modal==="create"?"Crear evento":"Guardar cambios"}</button>
                <button onClick={()=>setModal(null)} style={{flex:1,backgroundColor:"transparent",color:t.textMuted,padding:"10px",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",border:`1px solid ${t.border}`,cursor:"pointer"}}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal==="delete" && (
        <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
          <div style={{backgroundColor:t.bgModal,border:`1px solid ${t.border}`,padding:"2rem",width:"100%",maxWidth:380,textAlign:"center"}}>
            <h2 style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:8}}>¿Eliminar evento?</h2>
            <p style={{fontSize:12,color:t.textMuted,marginBottom:"1.5rem",lineHeight:1.6}}>Se eliminará <strong style={{color:t.text}}>{selected?.name}</strong>.</p>
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

function EventRow({event,canEdit,onEdit,onDelete,t}: {event:Event; canEdit:boolean; onEdit:(e:Event)=>void; onDelete:(e:Event)=>void; t:any}) {
  return (
    <div style={{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,padding:"1.25rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.5rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
        {event.flyer
          ? <img src={event.flyer} alt={event.name} style={{width:48,height:60,objectFit:"cover",flexShrink:0}}/>
          : <div style={{width:48,height:60,backgroundColor:t.bg,border:`1px solid ${t.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:t.textFaint}}>N/A</span></div>
        }
        <div>
          <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:2}}>{event.name}</div>
          <div style={{fontSize:11,color:t.textMuted}}>
            {event.startDate ? event.startDate : event.date}
            {(event.startTime||event.time) && ` · ${event.startTime||event.time}`}
            {event.venue&&` · ${event.venue}`}{event.city&&`, ${event.city}`}
          </div>
          <div style={{fontSize:10,color:t.textFaint,marginTop:2}}>{event.lineup.join(" / ")}</div>
        </div>
      </div>
      {canEdit && (
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={()=>onEdit(event)} style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:t.textMuted,background:"none",border:`1px solid ${t.border}`,padding:"4px 10px",cursor:"pointer"}}>Editar</button>
          <button onClick={()=>onDelete(event)} style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:t.danger,background:"none",border:`1px solid ${t.dangerBorder}`,padding:"4px 10px",cursor:"pointer"}}>Eliminar</button>
        </div>
      )}
    </div>
  );
}
