import { AnimatedSection } from "@/components/ui/animations";

export default function InfoPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <AnimatedSection>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-8">
          INFORMAÇÕES
        </h1>
        
        <div className="glass-card border border-white/10 rounded-2xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Sobre o PlayZone Bar</h2>
            <p className="text-muted-foreground leading-relaxed">
              O PlayZone Bar é um espaço inovador que combina a cultura gamer com a vida noturna. 
              Oferecemos uma experiência única com PCs de alta performance, consoles de última geração, 
              mesas de bilhar profissionais e um bar premium com drinks exclusivos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Horário de Funcionamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Terça a Domingo: 18h às 02h
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Localização</h2>
            <p className="text-muted-foreground leading-relaxed">
              Rua dos Gamers, 123 - Centro<br />
              São Paulo - SP
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              WhatsApp: (11) 99999-9999<br />
              Email: contato@playzonebar.com.br
            </p>
          </section>
        </div>
      </AnimatedSection>
    </div>
  );
}
