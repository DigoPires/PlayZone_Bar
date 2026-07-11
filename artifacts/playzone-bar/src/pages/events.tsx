import { AnimatedSection, StaggeredList, StaggerItem } from "@/components/ui/animations";
import { useListEvents } from "@workspace/api-client-react";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function EventsPage() {
  const { data: events, isLoading } = useListEvents();

  // Ensure events is an array
  const eventsArray = Array.isArray(events) ? events : [];

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <AnimatedSection className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          NOSSOS <span className="text-accent text-glow-accent">EVENTOS</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Campeonatos, festas temáticas e transmissões ao vivo. A energia máxima da PlayZone.
        </p>
      </AnimatedSection>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        </div>
      ) : eventsArray.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-xl max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">Sem eventos programados</h3>
          <p className="text-muted-foreground">Fique de olho em nossas redes sociais para novidades.</p>
        </div>
      ) : (
        <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {eventsArray.map((event) => (
            <StaggerItem key={event.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card rounded-xl overflow-hidden h-full flex flex-col group border border-white/5 hover:border-accent/50 transition-colors"
              >
                <div className="h-56 relative overflow-hidden bg-white/5">
                  <div className="absolute inset-0 bg-accent/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                  <img 
                    src={event.imageUrl || "/attached_assets/generated_images/event-placeholder.jpg"} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/attached_assets/generated_images/event-placeholder.jpg";
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                  
                  {event.featured && (
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-accent text-background text-xs font-bold rounded shadow-[0_0_10px_hsl(var(--accent))]">
                      DESTAQUE
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-sm font-bold">
                      <Calendar className="h-4 w-4 text-accent" />
                      {format(new Date(event.date), "dd/MMM", { locale: ptBR }).toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-display font-bold mb-3">
                    {event.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-6 flex-1">
                    {event.description || "Junte-se a nós neste evento épico na PlayZone."}
                  </p>
                  
                  <div className="space-y-3 mb-6 text-sm text-foreground/80 bg-background/50 p-4 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> Horário:</span>
                      <span className="font-bold">{format(new Date(event.date), "HH:mm")}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Local:</span>
                        <span className="font-bold text-right truncate max-w-[150px]">{event.location}</span>
                      </div>
                    )}
                    {event.capacity && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> Vagas:</span>
                        <span className="font-bold">{event.capacity}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto flex items-center gap-4">
                    <div className="flex-1 font-display font-bold text-xl text-accent">
                      {event.price && event.price > 0 ? `R$ ${event.price.toFixed(2)}` : "FREE"}
                    </div>
                    <Button variant="neonGreen" className="flex-1">
                      PARTICIPAR
                    </Button>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggeredList>
      )}
    </div>
  );
}
