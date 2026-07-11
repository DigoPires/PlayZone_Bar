import * as React from "react"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import { BackToTop } from "@/components/ui/back-to-top"
import { useLocation } from "wouter"
import { useBodyLock } from "@/hooks/use-body-lock"

// Context to share mobile menu state
const MobileMenuContext = React.createContext<{ isOpen: boolean }>({ isOpen: false })

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  
  // Bloqueia scroll quando menu mobile está aberto
  useBodyLock(mobileMenuOpen)
  
  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return (
    <MobileMenuContext.Provider value={{ isOpen: mobileMenuOpen }}>
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
        {/* Global decorative background elements */}
        <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-10 z-0"></div>
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>
        
        <Navbar onMenuToggle={setMobileMenuOpen} />
        
        <main className="flex-1 relative z-10 w-full pt-20">
          {children}
        </main>
        
        <Footer />
        <BackToTop mobileMenuOpen={mobileMenuOpen} />
      </div>
    </MobileMenuContext.Provider>
  )
}
