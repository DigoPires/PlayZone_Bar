import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetSettings } from "@workspace/api-client-react";
import { Gamepad2, Wine, Users, Clock, Star, ChevronDown } from "lucide-react";

export function HeroSection() {
  const { data: settings } = useGetSettings();
  
  // Scroll effect to darken background
  const [scrollY, setScrollY] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Calculate darkness based on scroll (0 to ensure 5% visibility at max)
  const darkness = Math.min(scrollY / 500, 0.5);
  
  return (
    <>
      {/* Background Image - separate from content to cover navbar too */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/img/background_hero2.png')" }}
      />
      
      {/* Single simple overlay */}
      <div 
        className="fixed inset-0 z-0 transition-opacity duration-150"
        style={{ backgroundColor: `rgba(0, 0, 0, ${0.45 + darkness})` }}
      />
      
      <section className="relative min-h-[92vh] overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-start text-left pt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-medium mb-4 md:mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Aberto hoje até 02:00
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold mb-4 md:mb-6 tracking-tight leading-tight">
            {settings?.heroTitlePurple || settings?.heroTitleWhite ? (
              <>
                <span className="text-glow-primary text-primary">{settings?.heroTitlePurple || "PLAY"}</span>
                <span className="text-white"> {settings?.heroTitleWhite || "ZONE"}</span>
              </>
            ) : (
              <>
                <span className="text-glow-primary text-primary">PLAYZONE</span>
              </>
            )}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 lg:mb-10 max-w-full md:max-w-2xl font-medium">
            {settings?.heroSubtitle || "Reserve Agora!"}
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 md:p-4 hover:bg-white/10 transition-colors"
            >
              <Gamepad2 className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1 md:mb-2" />
              <p className="text-xs md:text-sm font-medium">Gaming Premium</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 md:p-4 hover:bg-white/10 transition-colors"
            >
              <Wine className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1 md:mb-2" />
              <p className="text-xs md:text-sm font-medium">Drinks Exclusivos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 md:p-4 hover:bg-white/10 transition-colors"
            >
              <Users className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1 md:mb-2" />
              <p className="text-xs md:text-sm font-medium">Ambiente Social</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 md:p-4 hover:bg-white/10 transition-colors"
            >
              <Star className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1 md:mb-2" />
              <p className="text-xs md:text-sm font-medium">Experiência Única</p>
            </motion.div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
            <Link href="/reservations" className="w-full sm:w-auto">
              <Button size="lg" variant="neon" className="w-full sm:w-auto font-bold tracking-wide text-sm md:text-base">
                RESERVAR AGORA
              </Button>
            </Link>
            <Link href="/menu" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold tracking-wide border-white/20 hover:bg-white/10 text-sm md:text-base">
                VER CARDÁPIO
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom edge */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-white/5"></div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs text-muted-foreground">Ver mais</span>
          <ChevronDown className="h-6 w-6 text-primary opacity-70" />
        </motion.div>
      </motion.div>
      </section>
    </>
  );
}
