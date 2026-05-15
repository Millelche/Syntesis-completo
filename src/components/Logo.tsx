import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export const Logo = ({ variant = "dark", className }: LogoProps) => {
  const fillColor = variant === "dark" ? "#030903" : "#DAD8D8";
  
  return (
    <svg 
      viewBox="0 0 1788.64 894.96" 
      className={cn("h-8 w-auto", className)}
      aria-label="Syntesis"
    >
      <polygon 
        fill={fillColor}
        points="1788.64 180.02 1788.64 0 178.73 0 178.73 178.73 0 178.73 0 358.76 178.73 358.76 178.73 537.49 1608.61 537.49 1608.61 714.94 0 714.94 0 894.96 1431.17 894.96 1609.9 894.96 1609.9 716.23 1788.64 716.23 1788.64 536.2 1609.9 536.2 1609.9 357.47 180.02 357.47 180.02 180.02 1788.64 180.02"
      />
    </svg>
  );
};

export default Logo;
