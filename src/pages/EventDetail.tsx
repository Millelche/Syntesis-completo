import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { events as default_events } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

// UTC-3 Argentina
const TZ_OFFSET_HOURS = -3;

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    }).toUpperCase();
};

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        const fallback = default_events.find(e => e.slug === slug) ?? null;
        setEvent(fallback);
      } else {
        setEvent({
          id: data.id,
          name: data.name,
          slug: data.slug,
          date: data.date ?? "",
          startDate: data.start_date ?? data.date ?? "",
          startTime: data.start_time ?? "",
          endDate: data.end_date ?? "",
          endTime: data.end_time ?? "",
          venue: data.venue ?? "",
          city: data.city ?? "",
          flyer: data.flyer ?? "",
          description: data.description ?? "",
          lineup: data.lineup ?? [],
          setTimes: data.set_times ?? [],
          ticketLinks: data.ticket_links ?? [],
          recordedSets: data.recorded_sets ?? "",
          isPast: data.is_past ?? false,
        });
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const isEventEnded = () => {
    if (!event) return false;
    if (event.endDate && event.endTime) {
      const end = new Date(`${event.endDate}T${event.endTime}:00`);
      const endUTC = new Date(end.getTime() - TZ_OFFSET_HOURS * 60 * 60 * 1000);
      return endUTC < new Date();
    }
    return event.isPast ?? false;
  };

  if (loading) {
    return (
      <Layout theme="events">
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Cargando evento...</div>
        </section>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout theme="events">
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-display-lg font-display mb-4">Event Not Found</h1>
            <Link to="/events" className="text-primary hover:underline">← Back to Events</Link>
          </div>
        </section>
      </Layout>
    );
  }

  const ended = isEventEnded();
  const formattedDate = formatDate(event.startDate || event.date);

  return (
    <Layout theme="events">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          <Link to="/events" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 inline-block opacity-0 animate-fade-up">
            ← Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Flyer */}
            <div className="opacity-0 animate-fade-up stagger-1">
              <div className="aspect-[3/4] overflow-hidden bg-secondary sticky top-32">
                {event.flyer
                  ? <img src={event.flyer} alt={event.name} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center bg-black">
                      <span className="text-white font-bold text-xl tracking-widest text-center px-4">{event.name}</span>
                    </div>
                }
              </div>
            </div>

            {/* Info */}
            <div className="opacity-0 animate-fade-up stagger-2">
              {ended && (
                <span className="inline-block bg-muted text-muted-foreground text-xs uppercase tracking-widest px-3 py-1 mb-4">
                  Past Event
                </span>
              )}

              <div className="text-sm uppercase tracking-widest text-primary block mb-4">
                <div>{formattedDate}</div>
                {!ended && event.startTime && (
                  <div className="mt-1">{event.startTime} HS</div>
                )}
              </div>

              <h1 className="text-display-lg md:text-display-xl font-display mb-6">{event.name}</h1>

              <div className="mb-8 pb-8 border-b border-border/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">Venue</span>
                <p className="text-xl font-display">{event.venue}</p>
                <p className="text-muted-foreground">{event.city}</p>
              </div>

              {event.description && (
                <div className="mb-8 pb-8 border-b border-border/50">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">About</span>
                  <p className="text-lg leading-relaxed text-muted-foreground">{event.description}</p>
                </div>
              )}

              <div className="mb-8 pb-8 border-b border-border/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">Line-up</span>
                <div className="space-y-2">
                  {event.lineup.map((artist: string) => (
                    <p key={artist} className="text-2xl font-display">{artist}</p>
                  ))}
                </div>
              </div>

              {event.setTimes && event.setTimes.length > 0 && (
                <div className="mb-8 pb-8 border-b border-border/50">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">Set Times</span>
                  <div className="space-y-3">
                    {event.setTimes.map((set: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-lg font-display">{set.artist}</span>
                        <span className="text-muted-foreground">{set.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets — solo para eventos futuros */}
              {!ended && event.ticketLinks && event.ticketLinks.length > 0 && (
                <div className="mb-8">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">Get Tickets</span>
                  <div className="flex flex-wrap gap-4">
                    {event.ticketLinks.map((link: any) => (
                      <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary/90 transition-colors">
                        Buy Tickets ({link.name})
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Media — solo para eventos pasados */}
              {ended && (
                <div className="space-y-6">
                  {event.recordedSets && (
                    <div>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">Recorded Sets</span>
                      <a href={event.recordedSets} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors">
                        Listen on Soundcloud
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventDetail;
