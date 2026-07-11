import { useGetMe } from "@workspace/api-client-react";
import { useEffect } from "react";

export function useAuthGuard() {
  const { data: user, isLoading, error } = useGetMe({ 
    query: { 
      retry: false 
    } 
  });
  
  useEffect(() => {
    if (!isLoading && error) {
      window.location.href = "/login";
    }
  }, [isLoading, error]);
  
  return { user, isLoading };
}
