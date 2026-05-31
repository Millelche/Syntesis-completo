import { Link } from "react-router-dom";
import Logo from "./Logo";

interface FooterProps {
  variant?: "light" | "dark";
}

export const Footer = ({ variant = "light" }: FooterProps) => {
  const logoVariant = variant === "dark" ? "light" : "dark";
  
  return (
    <footer className="border-t border-border/20 py-12 mt-auto">
      <div className="container px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Link to="/">
            <Logo variant={logoVariant} className="h-6" />
          </Link>
          
          <div className="flex items-center gap-8">
            <a 
              href="https://www.instagram.com/syntesis.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors link-underline"
            >
              Instagram
            </a>
            <a 
              href="https://soundcloud.com/syntesis-485323313" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors link-underline"
            >
              Soundcloud
            </a>
            <a 
              href="https://es.ra.co/promoters/157639" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors link-underline"
            >
              RA
            </a>
            <a 
              href="https://www.youtube.com/@syntesis-ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors link-underline"
            >
              Youtube
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground">
            ® {new Date().getFullYear()} Syntesis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
