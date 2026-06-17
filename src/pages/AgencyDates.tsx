import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

// ─── Zona horaria ─────────────────────────────────────────────────────────────
// UTC-3 para Argentina. Cambiar este número para otra zona horaria.
const TZ_OFFSET_HOURS = -3;

function isDatePast(endDate?: string, endTime?: string): boolean {
  if (!endDate || !endTime) return false;
  // endDate/endTime están guardados como hora Argentina (UTC-3).
  // Forzamos interpretación UTC con "Z" y restamos el offset para obtener
  // el instante UTC real que representa esa hora Argentina.
  const naiveUTC = new Date(`${endDate}T${endTime}:00Z`);
  const endInstant = new Date(naiveUTC.getTime() - TZ_OFFSET_HOURS * 60 * 60 * 1000);
  return endInstant < new Date();
}

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
};

const AgencyDates = () => {
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("dates")
        .select("*")
        .order("start_date", { ascending: true });

      if (error || !data || data.length === 0) {
        setDates([]);
      } else {
        setDates(data.map(row => ({
          id: row.id,
          date: row.start_date ?? row.date ?? "",
          startDate: row.start_date ?? row.date ?? "",
          startTime: row.start_time ?? "",
          endDate: row.end_date ?? "",
          endTime: row.end_time ?? "",
          artists: row.artists ?? [],
          venue: row.venue ?? "",
          promoter: row.promoter ?? "",
          country: row.country ?? "",
          city: row.city ?? "",
          ticketUrl: row.ticket_url ?? "",
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  const upcoming = dates.filter(d => !isDatePast(d.endDate, d.endTime));
  const past     = dates.filter(d => isDatePast(d.endDate, d.endTime));

  return (
    <Layout theme="agency">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          <div className="mb-16 max-w-3xl">
            <Link to="/agency" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4 inline-block">
              ← Back to Roster
            </Link>
            <h1 className="text-display-lg md:text-display-xl font-display mb-6 opacity-0 animate-fade-up">
              NEXT DATES
            </h1>
            <p className="text-lg text-muted-foreground opacity-0 animate-fade-up stagger-1">
              Explore upcoming performances from our artists.
            </p>
          </div>

          {loading && (
            <div className="text-muted-foreground text-sm">Cargando fechas...</div>
          )}

          {!loading && upcoming.length === 0 && (
            <div className="text-muted-foreground text-sm mb-16">No hay próximas fechas disponibles.</div>
          )}

          {/* Upcoming Dates */}
          {!loading && upcoming.length > 0 && (
            <div className="mb-16 opacity-0 animate-fade-up stagger-2">
              <h2 className="text-display-sm font-display mb-8">Upcoming</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs uppercase tracking-widest">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">Artist</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">Promoter</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">City</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">Country</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-right">Tickets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((date, index) => (
                      <TableRow key={index} className="border-border/50 hover:bg-secondary/50">
                        <TableCell className="font-medium">
                          <div>{formatDate(date.startDate || date.date)}</div>
                          {date.startTime && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {date.startTime} HS
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-display">
                            {date.artists?.join(" & ") || date.artist}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{date.promoter}</TableCell>
                        <TableCell className="text-muted-foreground">{date.city}</TableCell>
                        <TableCell className="text-muted-foreground">{date.country}</TableCell>
                        <TableCell className="text-right">
                          {date.ticketUrl ? (
                            <a href={date.ticketUrl} target="_blank" rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm uppercase tracking-widest">
                              Buy Tickets
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Past Dates — comentado: descomentar si se quieren mostrar fechas pasadas
          {!loading && past.length > 0 && (
            <div className="opacity-0 animate-fade-up stagger-3">
              <h2 className="text-display-sm font-display mb-8 text-muted-foreground">Past</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs uppercase tracking-widest">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">Artist</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">Promoter</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">City</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest">Country</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {past.map((date, index) => (
                      <TableRow key={index} className="border-border/50 opacity-60">
                        <TableCell className="font-medium">{formatDate(date.startDate || date.date)}</TableCell>
                        <TableCell><span className="font-display">{date.artists?.join(" & ") || date.artist}</span></TableCell>
                        <TableCell className="text-muted-foreground">{date.promoter}</TableCell>
                        <TableCell className="text-muted-foreground">{date.city}</TableCell>
                        <TableCell className="text-muted-foreground">{date.country}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          */}

        </div>
      </section>
    </Layout>
  );
};

export default AgencyDates;
