import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { bookingDates as default_bookingDates } from "@/data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AgencyDates = () => {
  const stored_dates = localStorage.getItem("syntesis_dates");
  const bookingDates = stored_dates ? JSON.parse(stored_dates) : default_bookingDates;
  const sortedDates = [...bookingDates].sort((a, b) =>
    new Date(a.startDate || a.date).getTime() -
    new Date(b.startDate || b.date).getTime()
  );
    
  const isDateEnded = (date: any) => {
    if (
      date.endDate &&
      date.endTime &&
      date.endDate.trim() !== "" &&
      date.endTime.trim() !== ""
    ) {
      return new Date(
        `${date.endDate}T${date.endTime}`
      ) < new Date();
    }

    return false;
  };
    
  const futureDates = sortedDates.filter(
    d => !isDateEnded(d)
  );

  const pastDates = sortedDates.filter(
    d => isDateEnded(d)
  );

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

  return (
    <Layout theme="agency">
      <section className="pt-32 pb-20">
        <div className="container px-6 lg:px-12">
          <div className="mb-16 max-w-3xl">
            <Link 
              to="/agency" 
              className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4 inline-block"
            >
              ← Back to Roster
            </Link>
            <h1 className="text-display-lg md:text-display-xl font-display mb-6 opacity-0 animate-fade-up">
              NEXT DATES
            </h1>
            <p className="text-lg text-muted-foreground opacity-0 animate-fade-up stagger-1">
              Explora las próximas presentaciones de nuestros artistas.
            </p>
          </div>
          
          {/* Upcoming Dates */}
          {futureDates.length > 0 && (
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
                    {futureDates.map((date, index) => (
                      <TableRow key={index} className="border-border/50 hover:bg-secondary/50">
                        <TableCell className="font-medium">
                          {/* se correge para que no reste un dìa */}
                          {formatDate(date.startDate || date.date)}
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
                            <a 
                              href={date.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm uppercase tracking-widest"
                            >
                              Buy Tickets
                            </a>
                          ) : (
                            <Link 
                              to={`/agency/${date.artistSlug}`}
                              className="text-primary hover:underline text-sm uppercase tracking-widest"
                            >
                              Book
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Past Dates */}
          {pastDates.length > 0 && (
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
                    {pastDates.map((date, index) => (
                      <TableRow key={index} className="border-border/50 opacity-60">
                        <TableCell className="font-medium">
                          {formatDate(date.startDate || date.date)}
                        </TableCell>
                        <TableCell>
                            <span className="font-display">
                              {date.artists?.join(" & ") || date.artist}
                            </span>
                          </TableCell>
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
        </div>
      </section>
    </Layout>
  );
};

export default AgencyDates;
