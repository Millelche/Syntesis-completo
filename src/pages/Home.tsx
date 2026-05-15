import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Events Side - Dark (izquierda) */}
      <Link 
        to="/events"
        className={cn(
          "split-section flex-1 min-h-[50vh] md:min-h-screen",
          "cursor-pointer group"
        )}
        style={{ backgroundColor: "#030903" }}
      >
        <div className="text-center px-8">
          <div className="mb-8 flex justify-center">
            <Logo variant="light" className="h-16 md:h-24 transition-transform duration-500 group-hover:scale-110" />
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight" style={{ color: "#DAD8D8" }}>
            EVENTS
          </h2>
          <p className="mt-4 text-sm uppercase tracking-widest" style={{ color: "rgba(218, 216, 216, 0.6)" }}>
            Buy Tickets & Explore Past Events
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#DAD8D8" }}>
            <span>Enter</span>
            <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

      {/* Agency Side - Light (derecha) */}
      <Link 
        to="/agency"
        className={cn(
          "split-section flex-1 min-h-[50vh] md:min-h-screen",
          "cursor-pointer group"
        )}
        style={{ backgroundColor: "#DAD8D8" }}
      >
        <div className="text-center px-8">
          <div className="mb-8 flex justify-center">
            <Logo variant="dark" className="h-16 md:h-24 transition-transform duration-500 group-hover:scale-110" />
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight" style={{ color: "#030903" }}>
            AGENCY
          </h2>
          <p className="mt-4 text-sm uppercase tracking-widest" style={{ color: "rgba(3, 9, 3, 0.6)" }}>
            Artist Booking & Management
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "#030903" }}>
            <span>Enter</span>
            <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Home;
