import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

interface NavigationProps {
  theme?: "agency" | "events" | "auto";
}

export const Navigation = ({ theme = "auto" }: NavigationProps) => {
  const location = useLocation();
  
  const isEvents = location.pathname.startsWith("/events");
  const isAgency = location.pathname.startsWith("/agency");
  const isHome = location.pathname === "/";
  
  // Determine which theme to use
  const currentTheme = theme === "auto" 
    ? (isEvents ? "events" : "agency") 
    : theme;
  
  const logoVariant = currentTheme === "events" ? "light" : "dark";
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-colors duration-500",
      isHome ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b border-border/20"
    )}>
      <nav className="container flex items-center justify-between h-20 px-6 lg:px-12">
        <Link to="/" className="hover-lift">
          <Logo variant={isHome ? "dark" : logoVariant} className="h-6 md:h-8" />
        </Link>
        
        <div className="flex items-center gap-8 md:gap-12">
          <Link 
            to="/agency" 
            className={cn(
              "text-sm font-medium uppercase tracking-widest transition-colors duration-300 link-underline",
              isAgency ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            Agency
          </Link>
          <Link 
            to="/events" 
            className={cn(
              "text-sm font-medium uppercase tracking-widest transition-colors duration-300 link-underline",
              isEvents ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            Events
          </Link>
          <Link 
            to="/contact" 
            className={cn(
              "text-sm font-medium uppercase tracking-widest transition-colors duration-300 link-underline",
              location.pathname === "/contact" ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
