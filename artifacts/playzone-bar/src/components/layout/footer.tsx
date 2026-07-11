import { Link } from "wouter"
import { Gamepad2, Instagram, Facebook, MapPin, Mail, Phone } from "lucide-react"
import { useGetSettings } from "@workspace/api-client-react"

export function Footer() {
  const { data: settings } = useGetSettings()

  return (
    <footer className="bg-card border-t border-white/10 pt-16 pb-8 relative overflow-hidden">
      {/* Decorative scanline */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-flex">
              <img 
                src="/assets/img/Logo.png" 
                alt="PlayZone Logo" 
                className="h-8 w-auto transition-transform group-hover:scale-110"
              />
            </Link>
            <p className="text-muted-foreground mb-6">
              {settings?.aboutText?.substring(0, 100) || "O melhor lounge de esports de Itapeva. Experiência premium de jogos, fliperamas clássicos e coquetelaria mixológica."}...
            </p>
            <div className="flex gap-4">
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary/20 hover:text-secondary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-display font-bold mb-6 text-lg">Links Rápidos</h4>
            <ul className="space-y-3">
              <li><Link href="/reservations" className="text-muted-foreground hover:text-primary transition-colors">Reservas</Link></li>
              <li><Link href="/events" className="text-muted-foreground hover:text-primary transition-colors">Eventos</Link></li>
              <li><Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">Cardápio</Link></li>
              <li><Link href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">Galeria</Link></li>
              <li><Link href="/info" className="text-muted-foreground hover:text-primary transition-colors">Informações</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-display font-bold mb-6 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/rules" className="text-muted-foreground hover:text-primary transition-colors">Regras da Casa</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-display font-bold mb-6 text-lg">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span>{settings?.whatsapp || "(11) 99999-9999"}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <span>contato@playzonebar.com.br</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} PlayZone Bar. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
