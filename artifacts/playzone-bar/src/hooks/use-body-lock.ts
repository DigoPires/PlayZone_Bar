import { useEffect } from "react";

/**
 * Hook que desabilita o scroll da página quando ativado
 * Útil para modals, popups, menu hamburger, etc.
 */
export function useBodyLock(isLocked: boolean = true) {
  useEffect(() => {
    if (isLocked) {
      // Armazena o scroll atual antes de bloquear
      const scrollY = window.scrollY;
      
      // Desabilita scroll adicionando overflow hidden ao body
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      
      return () => {
        // Restaura scroll ao desmontar ou quando isLocked muda para false
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        // Volta para a posição anterior (opcional)
        window.scrollY && window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
}
