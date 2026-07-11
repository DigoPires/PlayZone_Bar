import { AnimatedSection } from "@/components/ui/animations";

export default function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <AnimatedSection>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-8">
          REGRAS DA CASA
        </h1>
        
        <div className="glass-card border border-white/10 rounded-2xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Regras Gerais</h2>
            <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-2">
              <li>Respeite todos os clientes e funcionários</li>
              <li>Mantenha o volume em níveis aceitáveis</li>
              <li>Não é permitido fumar dentro do estabelecimento</li>
              <li>Consumo de bebidas alcoólicas apenas para maiores de 18 anos</li>
              <li>Não é permitido entrar com alimentos e bebidas externas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Área PC Gamer</h2>
            <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-2">
              <li>É obrigatório o uso de fones de ouvido</li>
              <li>Não é permitido instalar programas não autorizados</li>
              <li>Respeite o tempo contratado</li>
              <li>Comportamento tóxico não será tolerado</li>
              <li>É permitido trazer seus próprios periféricos (mouse, teclado, headset)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Área de Consoles</h2>
            <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-2">
              <li>Respeite o tempo de uso dos consoles</li>
              <li>Cuide dos controles e equipamentos</li>
              <li>Não é permitido remover jogos do sistema</li>
              <li>Compartilhe os consoles de forma justa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Mesas e Bilhar</h2>
            <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-2">
              <li>Respeite o tempo da mesa reservada</li>
              <li>Não é permitido sentar nas mesas sem reserva</li>
              <li>Cuide dos tacos e bolas de bilhar</li>
              <li>Não é permitido jogar nas mesas de bilhar sem consumir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">Consequências</h2>
            <p className="text-muted-foreground leading-relaxed">
              O não cumprimento destas regras pode resultar em advertência, expulsão do estabelecimento 
              ou banimento permanente, dependendo da gravidade da infração.
            </p>
          </section>
        </div>
      </AnimatedSection>
    </div>
  );
}
