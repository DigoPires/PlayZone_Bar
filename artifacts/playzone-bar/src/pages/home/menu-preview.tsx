import { useListMenuItems } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function MenuPreviewSection() {
  const { data: items, isLoading } = useListMenuItems({ availableOnly: true });
  
  // Show only up to 6 items
  const previewItems = Array.isArray(items) ? items.slice(0, 6) : [];

  if (isLoading) return null;

  return (
    <section className="py-24 bg-card relative border-y border-white/5 overflow-hidden">
      {/* Background styling */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: "url('/attached_assets/generated_images/bar-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            ENERGY <span className="text-primary text-glow-primary">REFILL</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Burgers artesanais, porções para o squad e os drinks mais elétricos da cidade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto mb-12">
          {previewItems.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              {item.imageUrl ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-background border border-white/10 shrink-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                </div>
              )}
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <div className="border-b border-dashed border-white/20 flex-1 mx-4"></div>
                  <span className="font-bold text-primary">R$ {item.price.toFixed(2)}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/menu">
            <Button variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary hover:text-white">
              VER CARDÁPIO COMPLETO
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
