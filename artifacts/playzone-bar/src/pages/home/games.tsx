import { AnimatedSection, StaggeredList, StaggerItem, TiltCard } from "@/components/ui/animations";
import { MonitorPlay, Swords, Joystick } from "lucide-react";
import { useGames } from "@/hooks/use-games";

export function GamesSection() {
  const { games, loading } = useGames(6);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              JOGUE OS <span className="text-secondary text-glow-secondary">MELHORES</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Biblioteca com mais de 200 títulos atualizados constantemente, do competitivo hardcore ao multiplayer casual.
            </p>
          </AnimatedSection>
        </div>

        <StaggeredList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <StaggerItem key={i}>
                <TiltCard className="group relative h-48 rounded-xl overflow-hidden border border-white/10">
                  <div className="absolute inset-0 bg-muted animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted-foreground/10 rounded w-1/2"></div>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))
          ) : (
            games.map((game, i) => (
              <StaggerItem key={game.id}>
                <TiltCard className="group relative h-48 rounded-xl overflow-hidden border border-white/10 cursor-pointer">
                  <img 
                    src={game.background_image} 
                    alt={game.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4 transform transition-transform group-hover:-translate-y-2">
                    <h4 className="font-display font-bold text-lg leading-tight mb-1">{game.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">Rating: {game.rating.toFixed(1)}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))
          )}
        </StaggeredList>
      </div>
    </section>
  );
}
