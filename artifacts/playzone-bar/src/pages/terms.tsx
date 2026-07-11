import { AnimatedSection } from "@/components/ui/animations";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <AnimatedSection>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-8">
          TERMOS DE USO
        </h1>
        
        <div className="glass-card border border-white/10 rounded-2xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e utilizar o PlayZone Bar, você concorda com estes termos de uso. 
              Se você não concordar com qualquer parte destes termos, por favor, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">2. Idade Mínima</h2>
            <p className="text-muted-foreground leading-relaxed">
              Até as 20h, a entrada de menores a partir de 14 anos é permitida com autorização dos responsáveis. 
              Após as 20h, a entrada é estritamente para maiores de 18 anos, mediante apresentação de documento oficial com foto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">3. Reservas</h2>
            <p className="text-muted-foreground leading-relaxed">
              As reservas têm tolerância de 15 minutos de atraso. Após esse período, a mesa/PC será liberada. 
              Cancelamentos devem ser feitos com pelo menos 2 horas de antecedência.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">4. Comportamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Comportamento agressivo, discriminatório ou perturbador não será tolerado. 
              Reservamo-nos o direito de remover qualquer cliente que não respeite estas regras.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">5. Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O PlayZone Bar não se responsabiliza por objetos pessoais deixados sem supervisão. 
              Clientes são responsáveis por seus pertences pessoais.
            </p>
          </section>
        </div>
      </AnimatedSection>
    </div>
  );
}
