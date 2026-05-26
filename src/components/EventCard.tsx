import { Link } from "react-router-dom";
import type { Event } from "@/data/mockData";

interface EventCardProps {
  event: Event;
  index?: number;
}

export const EventCard = ({ event, index = 0 }: EventCardProps) => {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <Link 
      to={`/events/${event.slug}`}
      className="group block opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img 
          src={event.flyer} 
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {event.isPast && (
          <div className="absolute top-4 left-4">
            <span className="bg-muted/80 backdrop-blur-sm text-muted-foreground text-xs uppercase tracking-widest px-3 py-1">
              Past Event
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <span className="text-lg font-display font-bold text-foreground">
            View Details →
          </span>
        </div>
      </div>
      <div className="mt-4">
        <span className="text-xs uppercase tracking-widest text-primary block mb-1">
          {formattedDate} {event.time && ` · ${event.time}`}
        </span>
        <h3 className="text-display-sm font-display tracking-tight text-foreground">
          {event.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
  {event.venue}, {event.city}
</p>
      </div>
    </Link>
  );
};

export default EventCard;
