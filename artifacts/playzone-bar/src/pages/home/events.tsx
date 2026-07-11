import { AnimatedSection, StaggeredList, StaggerItem } from "@/components/ui/animations";
import { useListEvents } from "@workspace/api-client-react";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function EventHighlightSection() {
  const { data: eventsData, isLoading } = useListEvents({ upcoming: true });
  
  // Take up to 6 events for homepage (responsive layout)
  const events = Array.isArray(eventsData) ? eventsData.slice(0, 6) : [];

  if (isLoading || events.length === 0) return null;

  // Determine grid columns based on event count
  const getGridClass = () => {
    if (events.length === 1) return "justify-center";
    if (events.length === 2) return "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <section className="py-24 bg-background relative border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col justify-center items-center text-center mb-12 gap-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              PRÓXIMOS <span className="text-accent text-glow-accent">EVENTOS</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <Link href="/events">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-background">
                VER TODOS
              </Button>
            </Link>
          </AnimatedSection>
        </div>

        <StaggeredList className={`grid ${getGridClass()} gap-6 mx-auto`}>
          {events.map((event) => (
            <StaggerItem key={event.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-card rounded-xl overflow-hidden h-full flex flex-col group border border-white/5 hover:border-accent/50 transition-colors"
              >
                <div className="h-48 relative overflow-hidden bg-white/5">
                  <div className="absolute inset-0 bg-accent/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                  <img 
                    src={event.imageUrl || "/attached_assets/generated_images/event-placeholder.jpg"} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/attached_assets/generated_images/event-placeholder.jpg";
                    }}
                  />
                  {event.featured && (
                    <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-accent text-background text-xs font-bold rounded">
                      DESTAQUE
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-display font-bold mb-2">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mt-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span>{format(new Date(event.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent" />
                        <span>Vagas: {event.capacity}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="font-bold text-lg">
                      {event.price && event.price > 0 ? `R$ ${event.price.toFixed(2)}` : "Gratuito"}
                    </span>
                    <Button variant="neonGreen" size="sm">
                      SABER MAIS
                    </Button>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggeredList>
      </div>
    </section>
  );
}
