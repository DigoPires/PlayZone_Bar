import { useGetMe } from "@workspace/api-client-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useGetMe();

  console.log('ProtectedRoute state:', { 
    user: user ? 'exists' : 'null', 
    isLoading, 
    error: error ? error.message : 'none',
    fullUser: user,
    userId: user?.id,
    username: user?.username
  });

  // Force redirect if not authenticated - stricter check
  if (!isLoading && (!user || error || !user.id || !user.username)) {
    console.log('ProtectedRoute: Redirecting to login - invalid auth');
    window.location.href = "/admin-playzone/login";
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
}
