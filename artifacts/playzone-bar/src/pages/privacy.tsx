import { AnimatedSection } from "@/components/ui/animations";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <AnimatedSection>
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-8">
          POLÍTICA DE PRIVACIDADE
        </h1>
        
        <div className="glass-card border border-white/10 rounded-2xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">1. Coleta de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos informações pessoais como nome, telefone e email apenas quando necessário para 
              processar reservas e melhorar nossos serviços. Não coletamos dados sensíveis sem seu consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">2. Uso das Informações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos suas informações para:
            </p>
            <ul className="text-muted-foreground leading-relaxed list-disc list-inside space-y-2">
              <li>Processar e confirmar reservas</li>
              <li>Enviar notificações sobre suas reservas</li>
              <li>Melhorar nossos serviços</li>
              <li>Comunicar promoções (com seu consentimento)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">3. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto quando exigido por lei ou necessário para fornecer nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">4. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado, 
              alteração ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-4 text-primary">5. Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. 
              Entre em contato conosco para exercer esses direitos.
            </p>
          </section>
        </div>
      </AnimatedSection>
    </div>
  );
}
