import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

export function useUnsavedChanges(hasUnsavedChanges: boolean, message: string = 'Você tem alterações não salvas. Deseja sair mesmo assim?') {
  const [, setLocation] = useLocation();

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
    return undefined;
  }, [hasUnsavedChanges, message]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // Note: For in-app navigation, you'll need to handle this manually
  // since React Router/Wouter doesn't support blocking navigation natively
  // This hook primarily handles browser tab/window closing and refresh
}
