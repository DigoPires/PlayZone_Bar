import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "Como funciona a cobrança da área PC Gamer?",
      answer: "Você pode comprar pacotes de horas. O valor é debitado apenas quando você está logado no sistema. As horas não expiram e você pode usar em dias diferentes."
    },
    {
      question: "Preciso reservar antes de ir?",
      answer: "Recomendamos fortemente a reserva, especialmente aos finais de semana (sexta a domingo), pois operamos quase sempre com capacidade máxima."
    },
    {
      question: "Qual o valor da entrada?",
      answer: "O valor de entrada varia de acordo com o dia e se há evento especial. Consulte nossas redes sociais para a programação da semana."
    },
    {
      question: "Menores de idade podem entrar?",
      answer: "Até as 20h, a entrada de menores a partir de 14 anos é permitida com autorização. Após as 20h, a entrada é estritamente para maiores de 18 anos, mediante apresentação de documento oficial com foto."
    },
    {
      question: "Posso levar meus próprios periféricos?",
      answer: "Sim! Na área de PC Gamer você pode plugar seu próprio mouse, teclado ou headset se preferir, mas nossos equipamentos originais Logitech e Razer já são de altíssimo nível."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-background border-t border-white/5 relative z-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            PERGUNTAS <span className="text-primary text-glow-primary">FREQUENTES</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
              <AccordionTrigger className="text-lg font-medium text-left hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
