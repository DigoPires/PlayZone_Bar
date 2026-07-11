import { AnimatedSection, StaggeredList, StaggerItem, TiltCard } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { 
  Gamepad2, 
  Monitor, 
  Music, 
  Trophy, 
  MapPin, 
  Clock, 
  ChevronRight,
  MonitorPlay,
  Swords,
  Joystick,
  GlassWater,
  PartyPopper
} from "lucide-react";

// Components
import { HeroSection } from "./hero";
import { AboutSection } from "./about";
import { FacilitiesSection } from "./facilities";
import { GamesSection } from "./games";
import { EventHighlightSection } from "./events";
import { MenuPreviewSection } from "./menu-preview";
import { ReservationCTASection } from "./reservation-cta";
import { FAQSection } from "./faq";
import { LocationSection } from "./location";

export default function HomePage() {
  const { data: settings } = useGetSettings();
  
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <AboutSection />
      <FacilitiesSection />
      <GamesSection />
      
      {/* Área Gamer Highlight */}
      <section className="py-24 bg-card relative overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }}>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                <span className="text-glow-secondary text-secondary">ARENA</span> COMPETITIVA
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nossa área gamer foi projetada para alta performance. PCs de última geração com RTX 4080, monitores 240Hz, cadeiras ergonômicas e internet de fibra ótica dedicada.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "20 PCs High-End (Intel i9 / RTX 4080)",
                  "Monitores BenQ Zowie 240Hz 1ms",
                  "Periféricos Logitech G Pro & Razer",
                  "Salas Privativas para Squads (5x5)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    </div>
                    <span className="font-medium text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/reservations?type=gamer">
                <Button variant="neonBlue" size="lg" className="font-bold tracking-wide">
                  RESERVAR PC
                </Button>
              </Link>
            </AnimatedSection>
            
            <AnimatedSection animation={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } } }} className="relative h-[400px] md:h-[500px]">
              <div className="absolute inset-0 bg-secondary/10 rounded-2xl border border-secondary/20 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                {/* Fallback pattern since we don't have the real image yet */}
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <Gamepad2 className="h-32 w-32 text-secondary/30" />
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-sm font-medium">
                  Latência Média: <span className="text-accent">2ms</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <EventHighlightSection />
      <MenuPreviewSection />
      <ReservationCTASection />
      <FAQSection />
      <LocationSection />
    </div>
  );
}
