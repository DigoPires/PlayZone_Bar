import * as React from "react"
import { Link, useLocation } from "wouter"
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Gamepad2, 
  Utensils, 
  Image as ImageIcon, 
  Ticket, 
  Clock, 
  Settings, 
  LogOut,
  Menu,
  Home
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLogout, useGetMe } from "@workspace/api-client-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const adminLinks = [
  { href: "/admin-playzone", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-playzone/reservations", label: "Reservas", icon: CalendarCheck },
  { href: "/admin-playzone/events", label: "Eventos", icon: Gamepad2 },
  { href: "/admin-playzone/menu", label: "Cardápio", icon: Utensils },
  { href: "/admin-playzone/gallery", label: "Galeria", icon: ImageIcon },
  { href: "/admin-playzone/coupons", label: "Promoções", icon: Ticket },
  { href: "/admin-playzone/availability", label: "Disponibilidade", icon: Clock },
  { href: "/admin-playzone/settings", label: "Configurações", icon: Settings },
]

export function AdminSidebar() {
  const [location, setLocation] = useLocation()
  const logout = useLogout()
  const { data: user } = useGetMe()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        // Force page reload to clear all session state
        window.location.href = "/admin-playzone/login";
      }
    })
  }

  return (
    <div className="flex flex-col h-full w-64 bg-card border-r border-white/10">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link href="/admin-playzone" className="flex items-center gap-2 group">
          <img 
            src="/assets/img/Logo.png" 
            alt="PlayZone Logo" 
            className="h-8 w-auto transition-transform group-hover:scale-110"
          />
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-3">
          {adminLinks.map((link) => {
            const isActive = location === link.href || (link.href !== "/admin-playzone" && location.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_hsl(var(--primary)/0.1)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "Admin"}</span>
            <span className="text-xs text-muted-foreground">{user?.username || "admin"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 cursor-pointer"
            >
              <Home className="mr-2 h-4 w-4" />
              Site
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex-1 border-white/10 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [location] = useLocation()

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-sm h-full flex-1">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Mobile Header */}
        <header className="h-16 md:hidden flex items-center justify-between px-4 border-b border-white/10 bg-card">
          <Link href="/admin-playzone" className="flex items-center gap-2">
            <img 
              src="/assets/img/Logo.png" 
              alt="PlayZone Logo" 
              className="h-8 w-auto"
            />
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
          <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-5 z-0"></div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
