import { useState } from "react";
import { useListMenuCategories, useListMenuItems } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MenuPage() {
  const { data: categories, isLoading: isLoadingCategories } = useListMenuCategories();
  
  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories) ? categories : [];
  
  // Try to default to first category, fallback to 1 to load something if available
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  
  // Set first category as active when loaded
  if (categoriesArray.length > 0 && activeCategoryId === null) {
    setActiveCategoryId(categoriesArray[0].id);
  }

  const { data: items, isLoading: isLoadingItems } = useListMenuItems(
    { categoryId: activeCategoryId || undefined, availableOnly: true },
    { query: { enabled: !!activeCategoryId, queryKey: ['menuItems', activeCategoryId] } }
  );

  // Ensure items is an array
  const itemsArray = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-[80vh] relative pt-12 pb-24">
      {/* Visual background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: "url('/attached_assets/generated_images/bar-bg.jpg')" }}></div>
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            NOSSO <span className="text-primary text-glow-primary">CARDÁPIO</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Recarregue as energias com nossa seleção premium de drinks e snacks.
          </p>
        </div>

        {isLoadingCategories ? (
          <div className="flex justify-center mb-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar border-b border-white/10 gap-8">
            {categoriesArray.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "pb-4 font-display font-bold text-lg whitespace-nowrap transition-colors relative",
                  activeCategoryId === cat.id 
                    ? "text-primary text-glow-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.name.toUpperCase()}
                {activeCategoryId === cat.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-lg shadow-[0_0_10px_hsl(var(--primary))]"></div>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-[400px]">
          {isLoadingItems ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : !itemsArray || itemsArray.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Nenhum item disponível nesta categoria no momento.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {itemsArray.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-lg bg-white/5">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "/attached_assets/generated_images/menu-placeholder.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-2">
                      <h4 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <div className="border-b-2 border-dotted border-white/20 flex-1 mx-4 opacity-50 group-hover:border-primary/50 transition-colors"></div>
                      <span className="font-bold text-primary text-lg">R$ {item.price.toFixed(2)}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
