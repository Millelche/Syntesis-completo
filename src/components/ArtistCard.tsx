import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Artist } from "@/data/mockData";

interface ArtistCardProps {
  artist: Artist;
  index?: number;
}

export const ArtistCard = ({ artist, index = 0 }: ArtistCardProps) => {
  return (
    <Link 
      to={`/agency/${artist.slug}`}
      className="artist-card block opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img 
          src={artist.image} 
          alt={artist.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="artist-card-overlay flex items-end p-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary mb-2 block">
              {artist.location}
            </span>
            <span className="text-lg font-display font-bold">
              View Profile →
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-display-sm font-display tracking-tight">
          {artist.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wide">
          {artist.representation}
        </p>
      </div>
    </Link>
  );
};

export default ArtistCard;
