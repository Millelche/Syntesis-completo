import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ArtistCard from "@/components/ArtistCard";
import { artists as default_artists } from "@/data/mockData";

const Agency = () => {
  const stored_artists = localStorage.getItem("syntesis_artists");
  const artists = stored_artists ? JSON.parse(stored_artists) : default_artists;
  return (
    <Layout theme="agency">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          {/* Header */}
          <div className="mb-16 max-w-3xl">
            <h1 className="text-display-lg md:text-display-xl font-display mb-6 opacity-0 animate-fade-up">
              SYNTESIS ROSTER
            </h1>
            <p className="text-lg text-muted-foreground opacity-0 animate-fade-up stagger-1">
              Representando e impulsando el talento de grandes artistas.
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
          
          {/* Artist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {artists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} index={index} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Agency;
