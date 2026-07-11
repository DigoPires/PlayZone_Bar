import { AnimatedSection, StaggeredList, StaggerItem, TiltCard } from "@/components/ui/animations";
import { Monitor, Joystick, GlassWater, Users } from "lucide-react";

export function FacilitiesSection() {
  const facilities = [
    {
      icon: Monitor,
      title: "Área PC Gamer",
      description: "Setup de nível competitivo com monitores 240Hz, RTX 4080 e periféricos premium.",
      color: "primary",
    },
    {
      icon: Joystick,
      title: "Consoles Lounge",
      description: "Sofás confortáveis com PS5 e Xbox Series X em TVs 4K de 65 polegadas.",
      color: "secondary",
    },
    {
      icon: GlassWater,
      title: "Mixology Bar",
      description: "Drinks temáticos exclusivos inspirados nos maiores clássicos dos games.",
      color: "accent",
    },
    {
      icon: Users,
      title: "Salas Privativas",
      description: "Espaços acústicos para jogar em squad ou celebrar com amigos.",
      color: "primary",
    }
  ];

  return (
    <section className="py-24 bg-card relative z-10 border-t border-white/5">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">NOSSA <span className="text-primary text-glow-primary">ESTRUTURA</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Equipamentos de última geração em ambientes pensados para o máximo conforto.</p>
        </AnimatedSection>

        <StaggeredList className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, i) => (
            <StaggerItem key={i}>
              <TiltCard className={`glass-card p-8 rounded-2xl h-full flex flex-col items-center text-center border-t-4 border-t-${fac.color}`}>
                <div className={`h-16 w-16 rounded-full bg-${fac.color}/10 flex items-center justify-center mb-6`}>
                  <fac.icon className={`h-8 w-8 text-${fac.color}`} />
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{fac.title}</h3>
                <p className="text-muted-foreground text-sm">{fac.description}</p>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggeredList>
      </div>
    </section>
  );
}
