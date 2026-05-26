import Layout from "@/components/Layout";
import EventCard from "@/components/EventCard";
import { events as default_events } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Events = () => {
  const stored_events = localStorage.getItem("syntesis_events");
  const events = stored_events ? JSON.parse(stored_events) : default_events;

  // ← CAMBIO: se agrega .sort() para ordenar por fecha ascendente
  const upcomingEvents = events
    .filter((e) => !e.isPast)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events.filter((e) => e.isPast);
  const featuredEvent = upcomingEvents[0];

  // ← NUEVO: el resto de upcoming después del featured
  const nextEvents = upcomingEvents.slice(1);

  return (
    <Layout theme="events">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          {/* Featured Event */}
          {featuredEvent && (
            <div className="mb-24">
              <span className="text-xs uppercase tracking-widest text-primary mb-4 block opacity-0 animate-fade-up">
                Next Event
              </span>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="opacity-0 animate-fade-up stagger-1">
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                    <img
                      src={featuredEvent.flyer}
                      alt={featuredEvent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center opacity-0 animate-fade-up stagger-2">
                  <span className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                    {new Date(featuredEvent.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {featuredEvent.time && ` · ${featuredEvent.time}hs`}
                  </span>
                  <h1 className="text-display-lg md:text-display-xl font-display mb-4">
                    {featuredEvent.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-2">
                    {featuredEvent.venue}
                  </p>
                  <p className="text-muted-foreground mb-8">
                    {featuredEvent.city}
                  </p>

                  <div className="mb-8">
                    <h3 className="text-sm uppercase tracking-widest text-primary mb-4">
                      Line-up
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {featuredEvent.lineup.map((artist) => (
                        <span key={artist} className="text-lg font-display">
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {featuredEvent.ticketLinks?.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-primary/90 transition-colors"
                      >
                        Buy Tickets ({link.name})
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ← NUEVO: Next Events */}
          {nextEvents.length > 0 && (
            <div className="mb-24">
              <h2 className="text-display-md font-display mb-12 opacity-0 animate-fade-up">
                NEXT EVENTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {nextEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          <div>
            <h2 className="text-display-md font-display mb-12 opacity-0 animate-fade-up">
              PAST EDITIONS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {pastEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
