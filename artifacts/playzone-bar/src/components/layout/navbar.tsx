import * as React from "react"
import { Link, useLocation } from "wouter"
import { Menu, X, Gamepad2, Calendar, Utensils, Image as ImageIcon, MapPin, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [location] = useLocation()
  const [mounted, setMounted] = React.useState(false)

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/reservations", label: "Reservas", icon: Calendar },
    { href: "/events", label: "Eventos", icon: Gamepad2 },
    { href: "/menu", label: "Cardápio", icon: Utensils },
    { href: "/gallery", label: "Galeria", icon: ImageIcon },
  ]

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsOpen(false)
    onMenuToggle?.(false)
  }, [location, onMenuToggle])

  // Notify parent when menu opens/closes
  React.useEffect(() => {
    onMenuToggle?.(isOpen)
  }, [isOpen, onMenuToggle])

  // Entrance animation
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Change background on scroll
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        // Estado padrão (fechado): comportamento normal de scroll/transparência
        !isOpen && "md:bg-transparent bg-background/80 backdrop-blur-md border-b border-white/10",
        !isOpen && scrolled && "md:bg-background/80 md:backdrop-blur-md md:border-b md:border-white/10",
        // Quando o menu mobile está aberto: cor sólida, sem depender de opacidade/blur
        isOpen && "bg-background border-b border-white/10"
      )}
    >
      {/* Wrapper que recebe a animação de entrada. O transform fica isolado
          aqui para não quebrar o position:fixed do menu mobile abaixo. */}
      <div
        className={cn(
          "transition-all duration-300",
          mounted ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/assets/img/Logo.png"
                alt="PlayZone Logo"
                className="h-10 w-auto transition-transform group-hover:scale-110"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex gap-6">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary hover:text-glow-primary",
                      location === link.href ? "text-primary text-glow-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Link href="/reservations">
                <Button variant="neon" className="font-bold tracking-wide">
                  RESERVAR AGORA
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav — filho direto do <nav>, que não tem transform,
          então o fixed inset-0 se posiciona corretamente relativo à viewport */}
      <div
        className={cn(
          "md:hidden fixed inset-0 top-20 bg-background border-t border-white/10 transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col p-6 gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 text-lg font-medium p-4 rounded-lg transition-colors",
                location === link.href
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "hover:bg-white/5"
              )}
            >
              {link.icon && <link.icon className="h-5 w-5" />}
              {link.label}
            </Link>
          ))}

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
            <Link href="/reservations">
              <Button variant="neon" className="w-full py-6 text-lg">
                RESERVAR AGORA
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}