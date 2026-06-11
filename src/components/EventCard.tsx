import { Link } from "react-router-dom";
import type { Event } from "@/data/mockData";

interface EventCardProps {
  event: Event;
  index?: number;
}

export const EventCard = ({ event, index = 0 }: EventCardProps) => {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formattedDate = formatDate(
    event.startDate || event.date
  );


  const isEventEnded = () => {
      if (event.endDate && event.endTime) {
        return new Date(
          `${event.endDate}T${event.endTime}`
        ) < new Date();
      }

      return event.isPast;
  };
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
        {isEventEnded() && (
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
          <div>
            {formattedDate}
          </div>

          {!isEventEnded() && (
            <>
              {event.startTime && event.endTime ? (
                <div className="mt-1">
                  {event.startTime} → {event.endTime} HS
                </div>
              ) : (
                event.startTime && (
                  <div className="mt-1">
                    {event.startTime} HS
                  </div>
                )
              )}
            </>
          )}
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
