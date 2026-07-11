import { useState } from "react";
import { AnimatedSection, StaggeredList, StaggerItem } from "@/components/ui/animations";
import { useListGallery } from "@workspace/api-client-react";
import { Loader2, X } from "lucide-react";
import { useBodyLock } from "@/hooks/use-body-lock";

export default function GalleryPage() {
  const { data: images, isLoading } = useListGallery({ activeOnly: true });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Bloqueia scroll quando lightbox está aberto
  useBodyLock(!!selectedImage);

  // Ensure images is an array
  const imagesArray = Array.isArray(images) ? images : [];

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <AnimatedSection className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          A NOSSA <span className="text-secondary text-glow-secondary">VIBE</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A energia da PlayZone em pixels. Sinta a atmosfera antes mesmo de chegar.
        </p>
      </AnimatedSection>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 text-secondary animate-spin" />
        </div>
      ) : imagesArray.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-xl max-w-2xl mx-auto">
          <p className="text-muted-foreground">Galeria sendo atualizada. Volte em breve!</p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
          {imagesArray.map((img) => (
            <div 
              key={img.id}
              className="relative w-72 h-72 rounded-xl overflow-hidden cursor-pointer group border border-white/5 hover:border-secondary/50 transition-colors shadow-lg break-inside-avoid"
              onClick={() => setSelectedImage(img.url)}
            >
              <img 
                src={img.url} 
                alt={img.alt || "PlayZone Gallery"} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 text-white font-bold tracking-widest text-sm border border-white/30 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
                  AMPLIAR
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors z-10 p-2 rounded-full bg-black/50 hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={selectedImage} 
            alt="Ampliada" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
