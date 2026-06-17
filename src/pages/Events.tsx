import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import EventCard from "@/components/EventCard";
import { events as default_events } from "@/data/mockData";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const TZ_OFFSET_HOURS = -3;

function toAbsoluteUrl(url: string): string {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return "https://" + url;
}

function isEventEnded(event: any): boolean {
  if (event.endDate && event.endTime) {
    // event.endDate/endTime están guardados como hora Argentina (UTC-3).
    // Forzamos interpretación UTC con "Z" y luego restamos el offset para
    // obtener el instante UTC real que representa esa hora Argentina.
    const naiveUTC = new Date(`${event.endDate}T${event.endTime}:00Z`);
    const endInstant = new Date(naiveUTC.getTime() - TZ_OFFSET_HOURS * 60 * 60 * 1000);
    return endInstant < new Date();
  }
  return event.isPast ?? false;
}

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    }).toUpperCase();
};

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      if (error || !data || data.length === 0) {
        setEvents(default_events);
      } else {
        setEvents(data.map(row => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          date: row.date ?? "",
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
          recordedSetsLinks: Array.isArray(row.recorded_sets_links) ? row.recorded_sets_links : [],
          isPast: row.is_past ?? false,
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  const upcomingEvents = events
    .filter(e => !isEventEnded(e))
    .sort((a, b) => new Date(a.startDate || a.date).getTime() - new Date(b.startDate || b.date).getTime());

  const pastEvents = events.filter(e => isEventEnded(e));
  const featuredEvent = upcomingEvents[0];
  const nextEvents = upcomingEvents.slice(1);

  if (loading) return (
    <Layout theme="events">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12 text-muted-foreground text-sm">Cargando eventos...</div>
      </section>
    </Layout>
  );

  return (
    <Layout theme="events">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">

          {featuredEvent && (
            <div className="mb-24">
              <span className="text-xs uppercase tracking-widest text-primary mb-4 block opacity-0 animate-fade-up">Next Event</span>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="opacity-0 animate-fade-up stagger-1">
                  <Link to={`/events/${featuredEvent.slug}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-secondary cursor-pointer">
                      {featuredEvent.flyer
                        ? <img src={featuredEvent.flyer} alt={featuredEvent.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                        : <div className="w-full h-full flex items-center justify-center bg-black">
                            <span className="text-white font-bold text-xl tracking-widest text-center px-4">{featuredEvent.name}</span>
                          </div>
                      }
                    </div>
                  </Link>
                </div>
                <div className="flex flex-col justify-center opacity-0 animate-fade-up stagger-2">
                  <div className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                    <div>{formatDate(featuredEvent.startDate || featuredEvent.date)}</div>
                    {featuredEvent.startTime && <div className="mt-1">{featuredEvent.startTime} HS</div>}
                  </div>
                  <Link to={`/events/${featuredEvent.slug}`}>
                    <h1 className="text-display-lg md:text-display-xl font-display mb-4 hover:text-primary transition-colors cursor-pointer">
                      {featuredEvent.name}
                    </h1>
                  </Link>
                  <p className="text-lg text-muted-foreground mb-2">{featuredEvent.venue}</p>
                  <p className="text-muted-foreground mb-8">{featuredEvent.city}</p>
                  <div className="mb-8">
                    <h3 className="text-sm uppercase tracking-widest text-primary mb-4">Line-up</h3>
                    <div className="flex flex-wrap gap-3">
                      {featuredEvent.lineup.map((artist: string) => (
                        <span key={artist} className="text-lg font-display">{artist}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(featuredEvent.ticketLinks ?? []).map((link: {name:string;url:string}) => (
                      <a key={link.name} href={toAbsoluteUrl(link.url)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-primary/90 transition-colors">
                        Buy Tickets ({link.name})
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {nextEvents.length > 0 && (
            <div className="mb-24">
              <h2 className="text-display-md font-display mb-12 opacity-0 animate-fade-up">UPCOMING EVENTS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {nextEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-display-md font-display mb-12 opacity-0 animate-fade-up">PAST EDITIONS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {pastEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            </div>
          )}

          {!featuredEvent && pastEvents.length === 0 && (
            <div className="text-muted-foreground text-sm">No hay eventos disponibles.</div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Events;
