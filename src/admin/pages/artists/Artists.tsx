/**
 * Artists.tsx — v4
 * CRUD de artistas con Supabase como backend.
 * Merge: Supabase (master) + placeholder imagen, orden visual, links editables, validación (colegas)
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
    img.onerror = () => reject("Error al cargar la imagen");
    img.src = url;
  });
}

function generatePlaceholderImage(name: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800; canvas.height = 800;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 800, 800);
  ctx.fillStyle = "#000000";
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

const EMPTY: Artist = {
  id: "", name: "", slug: "", image: "", bio: "", genre: "",
  performances: [], labels: [], location: "", nationality: "",
  representation: "", socials: [], order: 0
};

export default function Artists() {
  const { can, currentUser, logAction, theme } = useAdmin();
  const t = theme === "dark" ? darkTheme : lightTheme;

  const hasView = currentUser?.isSuperAdmin || can("editor_artistas") || can("editor_eventos");
  if (!hasView) return <Navigate to="/admin/dashboard" replace />;
  const canEdit = currentUser?.isSuperAdmin || can("editor_artistas");

  const [artists, setArtists]   = useState<Artist[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<null|"create"|"edit"|"delete">(null);
  const [selected, setSelected] = useState<Artist|null>(null);
  const [form, setForm]         = useState<Artist>({...EMPTY});
  const [converting, setConv]   = useState(false);
  const [converted, setDone]    = useState(false);
  const [errors, setErrors]     = useState<string[]>([]);

  const inp: React.CSSProperties = { width:"100%", backgroundColor:t.bgInput, border:`1px solid ${t.border}`, color:t.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" };
  const lbl: React.CSSProperties = { fontSize:9, letterSpacing:"0.18em", color:t.textMuted, display:"block", marginBottom:5, textTransform:"uppercase" };

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("artists").select("*").order("sort_order", { ascending: true });
      if (error || !data || data.length === 0) {
        setArtists(defaultArtists);
      } else {
        setArtists(data.map(row => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          image: row.image ?? "",
          bio: row.bio ?? "",
          genre: row.genre ?? "",
          performances: row.performances ?? [],
          labels: row.labels ?? [],
          location: row.location ?? "",
          nationality: row.nationality ?? "",
          representation: row.representation ?? "",
          socials: Array.isArray(row.socials) ? row.socials : [],
          order: row.sort_order ?? 0,
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  function openCreate() { setForm({...EMPTY}); setErrors([]); setDone(false); setModal("create"); }
  function openEdit(a: Artist) {
    setSelected(a);
    setForm({ ...a, performances:[...a.performances], labels:[...a.labels], socials: Array.isArray(a.socials) ? [...a.socials] : [] });
    setErrors([]); setDone(false); setModal("edit");
  }
  function openDelete(a: Artist) { setSelected(a); setModal("delete"); }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setConv(true); setDone(false);
    try { const webp = await convertToWebP(file); setForm(f => ({...f, image: webp})); setDone(true); }
    catch { alert("Error al procesar la imagen."); }
    finally { setConv(false); }
  }

  async function handleSave() {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push("El nombre es obligatorio.");
    if (!form.genre.trim()) errs.push("El género es obligatorio.");
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);

    const slug = form.name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    const image = form.image || generatePlaceholderImage(form.name);
    const row = {
      id: modal === "create" ? Date.now().toString() : selected!.id,
      name: form.name,
      slug,
      image,
      bio: form.bio,
      genre: form.genre,
      performances: form.performances,
      labels: form.labels,
      location: form.location,
      nationality: form.nationality,
      representation: form.representation,
      socials: form.socials,
      sort_order: form.order ?? 0,
    };
    if (modal === "create") {
      const { error } = await supabase.from("artists").insert(row);
      if (error) { alert("Error al guardar: " + error.message); return; }
      setArtists(prev => [...prev, {...form, id: row.id, slug, image}]);
      logAction(`Creó artista "${form.name}"`, "artistas");
    } else if (modal === "edit" && selected) {
      const { error } = await supabase.from("artists").update(row).eq("id", selected.id);
      if (error) { alert("Error al guardar: " + error.message); return; }
      setArtists(prev => prev.map(a => a.id === selected.id ? {...form, slug, image} : a));
      logAction(`Editó artista "${form.name}"`, "artistas");
    }
    setModal(null);
  }

  async function handleDelete() {
    if (!selected) return;
    const { error } = await supabase.from("artists").delete().eq("id", selected.id);
    if (error) { alert("Error al eliminar: " + error.message); return; }
    setArtists(prev => prev.filter(a => a.id !== selected.id));
    logAction(`Eliminó artista "${selected.name}"`, "artistas");
    setModal(null);
  }

  if (loading) return <AdminLayout><div style={{padding:"2.5rem",color:t.textMuted,fontSize:13}}>Cargando artistas...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{padding:"2.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"2rem"}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,letterSpacing:"0.04em",color:t.text,marginBottom:4}}>Artistas</h1>
            <p style={{fontSize:11,color:t.textMuted}}>{artists.length} artistas en el roster{!canEdit && " · Solo lectura"}</p>
          </div>
          {canEdit && <button onClick={openCreate} style={{backgroundColor:t.accent,color:t.accentText,padding:"9px 18px",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",cursor:"pointer"}}>+ Nuevo artista</button>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))",gap:"1rem"}}>
          {[...artists].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).map(a => (
            <div key={a.id} style={{backgroundColor:t.bgCard,border:`1px solid ${t.border}`,overflow:"hidden"}}>
              <div style={{height:180,backgroundColor:t.bg,overflow:"hidden"}}>
                {a.image
                  ? <img src={a.image} alt={a.name} style={{width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(100%)"}}/>
                  : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:t.textFaint,fontSize:10,letterSpacing:"0.1em"}}>SIN FOTO</div>
                }
              </div>
              <div style={{padding:"1rem"}}>
                <div style={{fontSize:13,fontWeight:700,color:t.text,marginBottom:2}}>{a.name}</div>
                {a.order != null && a.order > 0 && <div style={{fontSize:9,letterSpacing:"0.12em",color:t.textFaint,marginBottom:4}}>#{a.order}</div>}
                <div style={{fontSize:10,color:t.textMuted,marginBottom:2}}>{a.genre}</div>
                <div style={{fontSize:10,color:t.textFaint,marginBottom:canEdit?"0.75rem":0}}>{a.location}</div>
                {canEdit && (
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>openEdit(a)} style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:t.textMuted,background:"none",border:`1px solid ${t.border}`,padding:"4px 10px",cursor:"pointer"}}>Editar</button>
                    <button onClick={()=>openDelete(a)} style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:t.danger,background:"none",border:`1px solid ${t.dangerBorder}`,padding:"4px 10px",cursor:"pointer"}}>Eliminar</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {(modal==="create"||modal==="edit") && (
        <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.88)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:100,padding:"2rem",overflowY:"auto"}}>
          <div style={{backgroundColor:t.bgModal,border:`1px solid ${t.border}`,padding:"2rem",width:"100%",maxWidth:640,marginBottom:"2rem"}}>
            <h2 style={{fontSize:12,fontWeight:700,letterSpacing:"0.15em",color:t.text,marginBottom:"1.75rem"}}>{modal==="create"?"NUEVO ARTISTA":`EDITAR — ${selected?.name}`}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div><label style={lbl}>Nombre *</label><input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ej: PAKARD"/></div>
                <div><label style={lbl}>Género *</label><input style={inp} value={form.genre} onChange={e=>setForm(f=>({...f,genre:e.target.value}))} placeholder="Ej: Techno"/></div>
                <div><label style={lbl}>Location</label><input style={inp} value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Ej: Buenos Aires, Argentina"/></div>
                <div><label style={lbl}>Representation</label><input style={inp} value={form.representation} onChange={e=>setForm(f=>({...f,representation:e.target.value}))} placeholder="Ej: Worldwide"/></div>
                <div><label style={lbl}>Nationality</label><input style={inp} value={form.nationality} onChange={e=>setForm(f=>({...f,nationality:e.target.value}))} placeholder="Ej: Argentina"/></div>
                <div>
                  <label style={lbl}>Orden de visualización</label>
                  <input type="number" min={1} style={inp} value={form.order ?? 0} onChange={e=>setForm(f=>({...f,order:Number(e.target.value)}))} placeholder="1"/>
                </div>
                <div><label style={lbl}>Performances (separar con coma)</label><input style={inp} value={form.performances.join(", ")} onChange={e=>setForm(f=>({...f,performances:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))} placeholder="Ej: DJ SET, B2B"/></div>
              </div>
              <div><label style={lbl}>Labels (separar con coma)</label><input style={inp} value={form.labels.join(", ")} onChange={e=>setForm(f=>({...f,labels:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))} placeholder="Ej: ROOM, Wangan Club"/></div>
              <div><label style={lbl}>Biografía</label><textarea style={{...inp,minHeight:100,resize:"vertical",lineHeight:1.6}} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}/></div>
              <div style={{borderTop:`1px solid ${t.border}`,paddingTop:"1.25rem"}}>
                <label style={lbl}>Links (máx. 10)</label>
                {(form.socials as {name:string;url:string}[]).map((link, i) => (
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 2fr auto",gap:"0.5rem",marginBottom:"0.5rem"}}>
                    <input style={inp} value={link.name} onChange={e=>{const u=[...form.socials as {name:string;url:string}[]];u[i]={...u[i],name:e.target.value.toUpperCase()};setForm(f=>({...f,socials:u}));}} placeholder="SOUNDCLOUD"/>
                    <input style={inp} value={link.url} onChange={e=>{const u=[...form.socials as {name:string;url:string}[]];u[i]={...u[i],url:e.target.value};setForm(f=>({...f,socials:u}));}} placeholder="https://"/>
                    <button onClick={()=>{const u=(form.socials as {name:string;url:string}[]).filter((_,j)=>j!==i);setForm(f=>({...f,socials:u}));}} style={{background:"none",border:`1px solid ${t.dangerBorder}`,color:t.danger,padding:"0 10px",cursor:"pointer",fontSize:12}}>✕</button>
                  </div>
                ))}
                {(form.socials as {name:string;url:string}[]).length < 10 && (
                  <button onClick={()=>setForm(f=>({...f,socials:[...f.socials as {name:string;url:string}[],{name:"",url:""}]}))} style={{fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:t.textMuted,background:"none",border:`1px solid ${t.border}`,padding:"6px 12px",cursor:"pointer",marginTop:4}}>+ Agregar link</button>
                )}
              </div>
              <div style={{borderTop:`1px solid ${t.border}`,paddingTop:"1.25rem"}}>
                <label style={lbl}>Foto del artista</label>
                <input type="file" accept="image/*" onChange={handleImage} style={{fontSize:12,color:t.textMuted,cursor:"pointer"}}/>
                {converting && <div style={{fontSize:11,color:t.textMuted,marginTop:8}}>⏳ Convirtiendo a WebP...</div>}
                {converted && !converting && <div style={{fontSize:11,color:t.success,marginTop:8}}>✓ Imagen optimizada para web (WebP)</div>}
                {form.image && !converting && <img src={form.image} alt="Preview" style={{marginTop:10,width:90,height:90,objectFit:"cover",border:`1px solid ${t.border}`}}/>}
              </div>
              {errors.length > 0 && (
                <div style={{backgroundColor:t.dangerBg,border:`1px solid ${t.dangerBorder}`,padding:"10px 14px"}}>
                  {errors.map((err,i) => <div key={i} style={{fontSize:11,color:t.danger,lineHeight:1.8}}>{err}</div>)}
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:"0.75rem"}}>
                <button onClick={handleSave} style={{flex:1,backgroundColor:t.accent,color:t.accentText,padding:"10px",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",border:"none",cursor:"pointer"}}>{modal==="create"?"Crear artista":"Guardar cambios"}</button>
                <button onClick={()=>setModal(null)} style={{flex:1,backgroundColor:"transparent",color:t.textMuted,padding:"10px",fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",border:`1px solid ${t.border}`,cursor:"pointer"}}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal==="delete" && (
        <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
          <div style={{backgroundColor:t.bgModal,border:`1px solid ${t.border}`,padding:"2rem",width:"100%",maxWidth:380,textAlign:"center"}}>
            <h2 style={{fontSize:14,fontWeight:700,color:t.text,marginBottom:8}}>¿Eliminar artista?</h2>
            <p style={{fontSize:12,color:t.textMuted,marginBottom:"1.5rem",lineHeight:1.6}}>Se eliminará <strong style={{color:t.text}}>{selected?.name}</strong> del roster.</p>
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
