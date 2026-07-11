import { useEffect } from "react";

/**
 * Hook que desabilita o scroll da página quando ativado
 * Útil para modals, popups, menu hamburger, etc.
 */
export function useBodyLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (scrollY !== 0) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isLocked]);
}
