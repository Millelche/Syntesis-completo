import { cn } from "@/lib/utils";
import Navigation from "./Navigation";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  theme?: "agency" | "events";
  hideNav?: boolean;
  hideFooter?: boolean;
}

export const Layout = ({ 
  children, 
  theme = "agency", 
  hideNav = false,
  hideFooter = false 
}: LayoutProps) => {
  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-background text-foreground",
      theme === "events" ? "events-theme" : "agency-theme"
    )}>
      {!hideNav && <Navigation theme={theme} />}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer variant={theme === "events" ? "dark" : "light"} />}
    </div>
  );
};

export default Layout;
