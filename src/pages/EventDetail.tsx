import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { events as default_events } from "@/data/mockData";

const EventDetail = () => {
  const stored_events = localStorage.getItem("syntesis_events");
  const events = stored_events ? JSON.parse(stored_events) : default_events;
  const { slug } = useParams<{ slug: string }>();
  const event = events.find(e => e.slug === slug);

  if (!event) {
    return (
      <Layout theme="events">
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-display-lg font-display mb-4">Event Not Found</h1>
            <Link to="/events" className="text-primary hover:underline">
              ← Back to Events
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Layout theme="events">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          <Link 
            to="/events" 
            className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 inline-block opacity-0 animate-fade-up"
          >
            ← Back to Events
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Event Flyer */}
            <div className="opacity-0 animate-fade-up stagger-1">
              <div className="aspect-[3/4] overflow-hidden bg-secondary sticky top-32">
                <img 
                  src={event.flyer} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Event Info */}
            <div className="opacity-0 animate-fade-up stagger-2">
              {event.isPast && (
                <span className="inline-block bg-muted text-muted-foreground text-xs uppercase tracking-widest px-3 py-1 mb-4">
                  Past Event
                </span>
              )}
              
              <span className="text-sm uppercase tracking-widest text-primary block mb-2">
                {formattedDate}
              </span>
              
              <h1 className="text-display-lg md:text-display-xl font-display mb-6">
                {event.name}
              </h1>
              
              {/* Venue */}
              <div className="mb-8 pb-8 border-b border-border/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                  Venue
                </span>
                <p className="text-xl font-display">{event.venue}</p>
                <p className="text-muted-foreground">{event.city}</p>
              </div>
              
              {/* Description */}
              <div className="mb-8 pb-8 border-b border-border/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">
                  About
                </span>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </div>
              
              {/* Line-up */}
              <div className="mb-8 pb-8 border-b border-border/50">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
                  Line-up
                </span>
                <div className="space-y-2">
                  {event.lineup.map(artist => (
                    <p key={artist} className="text-2xl font-display">
                      {artist}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* Set Times */}
              {event.setTimes && event.setTimes.length > 0 && (
                <div className="mb-8 pb-8 border-b border-border/50">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
                    Set Times
                  </span>
                  <div className="space-y-3">
                    {event.setTimes.map((set, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-lg font-display">{set.artist}</span>
                        <span className="text-muted-foreground">{set.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ticket Links (only for future events) */}
              {!event.isPast && event.ticketLinks && event.ticketLinks.length > 0 && (
                <div className="mb-8">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
                    Get Tickets
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {event.ticketLinks.map(link => (
                      <a 
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary/90 transition-colors"
                      >
                        Buy Tickets ({link.name})
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Past Event Media Links */}
              {event.isPast && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
                      Media
                    </span>
                    <div className="flex flex-wrap gap-4">
                      <a 
                        href="#"
                        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="square" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Photos & Videos
                      </a>
                      <a 
                        href="https://ra.co"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        View on RA
                      </a>
                    </div>
                  </div>
                  
                  {/* Recorded Sets */}
                  {event.recordedSets && (
                    <div>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
                        Recorded Sets
                      </span>
                      <a
                        href={event.recordedSets}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-4 text-sm font-medium uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
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
