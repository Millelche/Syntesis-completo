import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { artists as default_artists } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";
import { useAdmin } from "@/admin/context/AdminContext";
import { supabase } from "@/lib/supabase";

const ArtistDetail = () => {
  const { addBookingRequest } = useAdmin();
  const { slug } = useParams<{ slug: string }>();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    organizationName: "",
    promoterPage: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("artists").select("*").eq("slug", slug).single();
      if (error || !data) {
        const stored = localStorage.getItem("syntesis_artists");
        const local = stored ? JSON.parse(stored) : default_artists;
        setArtist(local.find((a: any) => a.slug === slug) ?? null);
      } else {
        setArtist({
          ...data,
          socials: Array.isArray(data.socials) ? data.socials : [],
        });
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <Layout theme="agency">
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center text-muted-foreground">Cargando...</div>
        </section>
      </Layout>
    );
  }

  if (!artist) {
    return (
      <Layout theme="agency">
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-display-lg font-display mb-4">Artist Not Found</h1>
            <Link to="/agency" className="text-primary hover:underline">← Back to Roster</Link>
          </div>
        </section>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await addBookingRequest({
      artist: artist.name,
      name: formData.name,
      organizationName: formData.organizationName,
      promoterPage: formData.promoterPage,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      message: formData.message,
    });

    try {
      await emailjs.send(
        "service_6mtajxs",
        "booking_request",
        {
          artist:        artist.name,
          name:          formData.name,
          organization:  formData.organizationName,
          promoter_page: formData.promoterPage,
          email:         formData.email,
          phone:         formData.phone,
          city:          formData.city,
          message:       formData.message,
          date:          new Date().toLocaleString("es-AR"),
        },
        "gRvFi6ZHl2t2EQHD9"
      );
    } catch (error) {
      console.error("Error al enviar el mail de booking:", error);
    }

    toast({
      title: "Booking request sent",
      description: `Thank you for your interest in booking ${artist.name}. We will be in touch soon.`,
    });

    setFormData({ name:"", organizationName:"", promoterPage:"", email:"", phone:"", city:"", message:"" });
  };

  const socials: {name:string;url:string}[] = Array.isArray(artist.socials) ? artist.socials : [];

  function toAbsoluteUrl(url: string): string {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return "https://" + url;
  }

  return (
    <Layout theme="agency">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          <Link to="/agency" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 inline-block opacity-0 animate-fade-up">
            ← Back to Roster
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Artist Image */}
            <div className="opacity-0 animate-fade-up stagger-1">
              <div className="aspect-[3/4] overflow-hidden bg-secondary sticky top-32">
                {artist.image
                  ? <img src={artist.image} alt={artist.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center bg-white">
                      <span className="text-black font-bold text-2xl tracking-widest">{artist.name}</span>
                    </div>
                }
              </div>
            </div>

            {/* Artist Info */}
            <div className="opacity-0 animate-fade-up stagger-2">
              <h1 className="text-display-lg md:text-display-xl font-display mb-6">{artist.name}</h1>

              <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-border/50">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Performances</span>
                  <span className="font-display">{(artist.performances ?? []).join(" / ")}</span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Genre</span>
                  <span className="font-display">{artist.genre}</span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Representation</span>
                  <span className="font-display">{artist.representation}</span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Location</span>
                  <span className="font-display">{artist.location}</span>
                </div>
              </div>

              {(artist.labels ?? []).length > 0 && (
                <div className="mb-8 pb-8 border-b border-border/50">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Labels</span>
                  <div className="flex flex-wrap gap-2">
                    {(artist.labels ?? []).map((label: string) => (
                      <span key={label} className="bg-secondary px-4 py-2 text-sm font-medium">{label}</span>
                    ))}
                  </div>
                </div>
              )}

              {artist.bio && (
                <div className="mb-8 pb-8 border-b border-border/50">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Biography</span>
                  <p className="text-lg leading-relaxed text-muted-foreground">{artist.bio}</p>
                </div>
              )}

              {socials.length > 0 && (
                <div className="mb-8 pb-8 border-b border-border/50">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">Links</span>
                  <div className="flex flex-wrap gap-4">
                    {socials.map(link => (
                      <a key={link.name} href={toAbsoluteUrl(link.url)} target="_blank" rel="noopener noreferrer"
                        className="text-sm uppercase tracking-widest hover:text-primary transition-colors link-underline">
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Form */}
              <div className="bg-card border border-border/50 p-8">
                <h2 className="text-display-sm font-display mb-2">Book {artist.name}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Contact: <a href="mailto:bookings@syntesis.ar" className="text-primary hover:underline">bookings@syntesis.ar</a>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Your Name *" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required maxLength={50} onInvalid={e=>(e.target as HTMLInputElement).setCustomValidity("Please fill out this field.")} onInput={e=>(e.target as HTMLInputElement).setCustomValidity("")} className="bg-background border-border/50"/>
                    <Input placeholder="Organization Name" value={formData.organizationName} onChange={e=>setFormData({...formData,organizationName:e.target.value})} maxLength={50} className="bg-background border-border/50"/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Organization Page URL" value={formData.promoterPage} onChange={e=>setFormData({...formData,promoterPage:e.target.value})} maxLength={50} className="bg-background border-border/50"/>
                    <Input type="email" placeholder="Email *" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} required maxLength={50} onInvalid={e=>{const el=e.target as HTMLInputElement; el.setCustomValidity(el.validity.valueMissing ? "Please fill out this field." : "Please enter a valid email address.");}} onInput={e=>(e.target as HTMLInputElement).setCustomValidity("")} className="bg-background border-border/50"/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input type="tel" placeholder="Phone Number" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} maxLength={50} className="bg-background border-border/50"/>
                    <Input placeholder="City / Country *" value={formData.city} onChange={e=>setFormData({...formData,city:e.target.value})} required maxLength={50} onInvalid={e=>(e.target as HTMLInputElement).setCustomValidity("Please fill out this field.")} onInput={e=>(e.target as HTMLInputElement).setCustomValidity("")} className="bg-background border-border/50"/>
                  </div>
                  <Textarea placeholder="Event details, date, venue..." value={formData.message} onChange={e=>setFormData({...formData,message:e.target.value})} rows={4} maxLength={1000} className="bg-background border-border/50 resize-none"/>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest py-6">BOOK</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ArtistDetail;
