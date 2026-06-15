import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ArtistCard from "@/components/ArtistCard";
import { artists as default_artists } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

const Agency = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error || !data || data.length === 0) {
        setArtists(default_artists);
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

  return (
    <Layout theme="agency">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          <div className="mb-16 max-w-3xl">
            <h1 className="text-display-lg md:text-display-xl font-display mb-6 opacity-0 animate-fade-up">
              SYNTESIS ROSTER
            </h1>
            <p className="text-lg text-muted-foreground opacity-0 animate-fade-up stagger-1">
              Representing and promoting the talent of great artists.
            </p>
            <div className="mt-8 flex gap-4 opacity-0 animate-fade-up stagger-2">
              <Link
                to="/agency/dates"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                View Next Dates
              </Link>
            </div>
          </div>

          {loading && (
            <div className="text-muted-foreground text-sm">Cargando artistas...</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[...artists]
              .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
              .map((artist, index) => (
                <ArtistCard key={artist.id} artist={artist} index={index} />
              ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Agency;
