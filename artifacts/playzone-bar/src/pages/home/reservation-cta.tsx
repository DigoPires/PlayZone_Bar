import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

export function ReservationCTASection() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden z-0">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_hsl(var(--primary)/0.1)]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                GARANTE SEU <span className="text-primary text-glow-primary">LUGAR</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nossas mesas e PCs são disputados. Faça sua reserva antecipada e não fique de fora do jogo.
              </p>
              
              <div className="flex gap-4">
                <Link href="/reservations">
                  <Button variant="neon" size="lg" className="font-bold tracking-wide">
                    RESERVAR AGORA
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="ghost" size="lg" className="hover:bg-white/5">
                    Ver Eventos
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              {/* Decorative elements representing a booking calendar/system */}
              <div className="relative h-[300px] w-full">
                <div className="absolute right-0 top-0 w-64 glass-panel p-4 rounded-xl border-primary/30 transform rotate-6 shadow-2xl animate-[pulse_4s_ease-in-out_infinite]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <div className="font-bold text-sm">Reserva Confirmada</div>
                      <div className="text-xs text-muted-foreground">Mesa Bilhar VIP</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded"></div>
                    <div className="h-2 w-2/3 bg-white/5 rounded"></div>
                  </div>
                </div>
                
                <div className="absolute left-10 bottom-10 w-72 glass-panel p-4 rounded-xl border-secondary/30 transform -rotate-3 shadow-2xl animate-[pulse_5s_ease-in-out_infinite_0.5s]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-secondary"></div>
                    </div>
                    <div>
                      <div className="font-bold text-sm">PC Gamer #04</div>
                      <div className="text-xs text-muted-foreground">Hoje, 20:00 - 23:00</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded"></div>
                    <div className="h-2 w-3/4 bg-white/5 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
