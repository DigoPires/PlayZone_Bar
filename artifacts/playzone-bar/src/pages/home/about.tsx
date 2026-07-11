import { AnimatedSection, slideInRight, slideInLeft } from "@/components/ui/animations";
import { useGetSettings } from "@workspace/api-client-react";
import { SpinningPokerChip } from "@/components/spinning-poker-chip";

export function AboutSection() {
  const { data: settings } = useGetSettings();
  
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <AnimatedSection animation={slideInLeft}>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full z-0"></div>
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-card border border-white/10 rounded-2xl h-48 sm:h-64 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">Arcade View</div>
                  </div>
                  <div className="bg-card border border-white/10 rounded-2xl h-32 sm:h-48 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">Drink View</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-card border border-white/10 rounded-2xl h-32 sm:h-48 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-accent/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">PC Setup</div>
                  </div>
                  <div className="bg-card border border-white/10 rounded-2xl h-48 sm:h-64 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">Lounge View</div>
                  </div>
                </div>
                
                {/* Spinning Poker Chip */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <SpinningPokerChip size={96} />
                </div>
              </div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation={slideInRight}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              MUITO MAIS QUE <br />
              <span className="text-glow-primary text-primary">UM BAR</span>
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                {settings?.aboutText || "A PlayZone nasceu da paixão pelos games e da vontade de criar um espaço onde a cultura gamer e a vida noturna se encontram. Não somos um bar com alguns fliperamas no canto. Somos uma arena de entretenimento."}
              </p>
              <p>
                Nossa arquitetura moderna e inovadora cria uma atmosfera imersiva onde o tempo passa diferente. Dos PCs de alta performance às mesas de bilhar profissionais, cada detalhe foi pensado para a sua diversão.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div>
                <div className="text-4xl font-display font-bold text-foreground mb-2">20+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">PCs High-End</div>
              </div>
              <div>
                <div className="text-4xl font-display font-bold text-foreground mb-2">15+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Cocktails</div>
              </div>
              <div>
                <div className="text-4xl font-display font-bold text-foreground mb-2">3</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Salas Privativas</div>
              </div>
              <div>
                <div className="text-4xl font-display font-bold text-foreground mb-2">300m²</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">De Pura Energia</div>
              </div>
            </div>
          </AnimatedSection>
          
        </div>
      </div>
    </section>
  );
}
