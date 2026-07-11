import { AnimatedSection } from "@/components/ui/animations";
import { MapPin } from "lucide-react";
import { useGetSettings } from "@workspace/api-client-react";

export function LocationSection() {
  const { data: settings } = useGetSettings();

  // Only render if Google Maps URL is configured
  if (!settings?.googleMapsUrl) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              NOSSA <span className="text-primary text-glow-primary">LOCALIZAÇÃO</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre-nos facilmente no coração da cidade. Venha fazer parte da experiência PlayZone.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Address Display */}
            {settings?.address && (
              <div className="glass-card rounded-2xl p-8 border border-white/10 flex items-center justify-center gap-4 bg-card/50 backdrop-blur-sm">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xl font-medium text-foreground">{settings.address}</p>
              </div>
            )}
            
            {/* Google Maps */}
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
              <iframe
                src={settings.googleMapsUrl}
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - PlayZone Bar Location"
                className="w-full"
              />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
