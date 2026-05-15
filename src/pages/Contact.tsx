import Layout from "@/components/Layout";
import Logo from "@/components/Logo";

const Contact = () => {
  return (
    <Layout theme="agency">
      <section className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="container px-6 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-12 opacity-0 animate-fade-up">
              <Logo variant="dark" className="h-16" />
            </div>
            
            <h1 className="text-display-lg md:text-display-xl font-display mb-8 opacity-0 animate-fade-up stagger-1">
              GET IN TOUCH
            </h1>
            
            <p className="text-lg text-muted-foreground mb-12 opacity-0 animate-fade-up stagger-2">
              Syntesis is an electronic music event producer and artist booking agency 
              based in Buenos Aires. We specialize in bringing the finest underground 
              talent to Latin America and beyond.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 opacity-0 animate-fade-up stagger-3">
              <div className="p-8 bg-card border border-border/50">
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">
                  General / Events
                </h3>
                <a 
                  href="mailto:contacto@syntesis.ar" 
                  className="text-display-sm font-display hover:text-primary transition-colors link-underline"
                >
                  contacto@syntesis.ar
                </a>
              </div>
              
              <div className="p-8 bg-card border border-border/50">
                <h3 className="text-sm uppercase tracking-widest text-primary mb-4">
                  Artist Booking
                </h3>
                <a 
                  href="mailto:bookings@syntesis.ar" 
                  className="text-display-sm font-display hover:text-primary transition-colors link-underline"
                >
                  bookings@syntesis.ar
                </a>
              </div>
            </div>
            
            <div className="opacity-0 animate-fade-up stagger-4">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
                Follow Us
              </h3>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <a 
                  href="https://www.instagram.com/syntesis.ar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-display uppercase tracking-widest hover:text-primary transition-colors link-underline"
                >
                  Instagram
                </a>
                <a 
                  href="https://soundcloud.com/syntesis-485323313" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-display uppercase tracking-widest hover:text-primary transition-colors link-underline"
                >
                  Soundcloud
                </a>
                <a 
                  href="https://www.youtube.com/@syntesis-ar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-display uppercase tracking-widest hover:text-primary transition-colors link-underline"
                >
                  Youtube
                </a>
                <a 
                  href="https://es.ra.co/promoters/157639" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-display uppercase tracking-widest hover:text-primary transition-colors link-underline"
                >
                  Resident Advisor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
